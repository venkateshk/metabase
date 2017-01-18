(ns metabase.api.public
  "Metabase API endpoints for viewing publically-accessible Cards and Dashboards."
  (:require [cheshire.core :as json]
            [compojure.core :refer [GET POST]]
            [schema.core :as s]
            (metabase.api [card :as card-api]
                          [common :as api]
                          [dataset :as dataset-api])
            [metabase.db :as db]
            (metabase.models [card :refer [Card]]
                             [dashboard :refer [Dashboard]]
                             [dashboard-card :refer [DashboardCard]]
                             [dashboard-card-series :refer [DashboardCardSeries]]
                             [field-values :refer [FieldValues]]
                             [hydrate :refer [hydrate]])
            [metabase.public-settings :as public-settings]
            [metabase.query-processor :as qp]
            (metabase.query-processor [expand :as ql]
                                      interface)
            [metabase.util :as u]
            [metabase.util.schema :as su]
            [metabase.util.embed :refer [embed-iframe]])
  (:import metabase.query_processor.interface.FieldPlaceholder))

(def default-embed-max-height 800)
(def default-embed-max-width 1024)

;;; ------------------------------------------------------------ Public Cards ------------------------------------------------------------

(defn- run-query-for-card-with-id [card-id parameters & options]
  (api/check-public-sharing-enabled)
  (let [parameters (json/parse-string parameters keyword)]
    (binding [api/*current-user-permissions-set*     (atom #{"/"})
              qp/*allow-queries-with-no-executor-id* true]
      (apply card-api/run-query-for-card card-id, :parameters parameters, options))))

(defn- run-query-for-card-with-public-uuid [uuid parameters & options]
  (apply run-query-for-card-with-id (api/check-404 (db/select-one-id Card :public_uuid uuid)) parameters options))

(api/defendpoint GET "/card/:uuid"
  "Fetch a publically-accessible Card an return query results as well as `:card` information. Does not require auth credentials. Public sharing must be enabled."
  [uuid parameters]
  {parameters (s/maybe su/JSONString)}
  (api/let-404 [card (db/select-one [Card :id :display :name :description :visualization_settings] :public_uuid uuid)]
    (assoc (run-query-for-card-with-id (u/get-id card) parameters)
      :card card)))

(api/defendpoint GET "/card/:uuid/json"
  "Fetch a publically-accessible Card and return query results as JSON. Does not require auth credentials. Public sharing must be enabled."
  [uuid parameters]
  {parameters (s/maybe su/JSONString)}
  (dataset-api/as-json (run-query-for-card-with-public-uuid uuid parameters, :constraints nil)))

(api/defendpoint GET "/card/:uuid/csv"
  "Fetch a publically-accessible Card and return query results as CSV. Does not require auth credentials. Public sharing must be enabled."
  [uuid parameters]
  {parameters (s/maybe su/JSONString)}
  (dataset-api/as-csv (run-query-for-card-with-public-uuid uuid parameters, :constraints nil)))


;;; ------------------------------------------------------------ Public Dashboards ------------------------------------------------------------

;; TODO - This logic seems too complicated for a one-off custom response format. Simplification would be nice, as would potentially
;;        moving some of this logic into a shared module

(defn- field-form->id
  "Expand a `field-id` or `fk->` FORM and return the ID of the Field it references.

     (field-form->id [:field-id 100])  ; -> 100"
  [field-form]
  (when-let [field-placeholder (u/ignore-exceptions (ql/expand-ql-sexpr field-form))]
    (when (instance? FieldPlaceholder field-placeholder)
      (:field-id field-placeholder))))

(defn- template-tag->field-form
  "Fetch the `field-id` or `fk->` form from DASHCARD referenced by TEMPLATE-TAG.

     (template-tag->field-form [:template-tag :company] some-dashcard) ; -> [:field-id 100]"
  [[_ tag] dashcard]
  (get-in dashcard [:card :dataset_query :native :template_tags (keyword tag) :dimension]))

(defn- param-target->field-id
  "Parse a Card parameter TARGET form, which looks something like `[:dimension [:field-id 100]]`, and return the Field ID
   it references (if any)."
  [target dashcard]
  (when (ql/is-clause? :dimension target)
    (let [[_ dimension] target]
      (field-form->id (if (ql/is-clause? :template-tag dimension)
                        (template-tag->field-form dimension dashcard)
                        dimension)))))

(defn- dashboard->param-field-ids
  "Return a set of Field IDs referenced by parameters in Cards in this DASHBOARD, or `nil` if none are referenced."
  [dashboard]
  (when-let [ids (seq (for [dashcard (:ordered_cards dashboard)
                            param    (:parameter_mappings dashcard)
                            :let     [field-id (param-target->field-id (:target param) dashcard)]
                            :when    field-id]
                        field-id))]
    (set ids)))

(defn- dashboard->param-field-values
  "Return a map of Field ID to FieldValues (if any) for any Fields referenced by Cards in DASHBOARD,
   or `nil` if none are referenced or none of them have FieldValues."
  [dashboard]
  (when-let [param-field-ids (dashboard->param-field-ids dashboard)]
    (u/key-by :field_id (db/select [FieldValues :values :human_readable_values :field_id]
                          :field_id [:in param-field-ids]))))

(defn- add-field-values-for-parameters
  "Add a `:param_values` map containing FieldValues for the parameter Fields in the DASHBOARD/"
  [dashboard]
  (assoc dashboard :param_values (dashboard->param-field-values dashboard)))

(api/defendpoint GET "/dashboard/:uuid"
  "Fetch a publically-accessible Dashboard. Does not require auth credentials. Public sharing must be enabled."
  [uuid]
  (api/check-public-sharing-enabled)
  (add-field-values-for-parameters (hydrate (api/check-404 (Dashboard :public_uuid uuid)) [:ordered_cards :card :series])))

(api/defendpoint GET "/dashboard/:uuid/card/:card-id"
  "Fetch the results for a Card in a publically-accessible Dashboard. Does not require auth credentials. Public sharing must be enabled."
  [uuid card-id parameters]
  {parameters (s/maybe su/JSONString)}
  (api/check-public-sharing-enabled)
  (api/check-404 (let [dashboard-id (api/check-404 (db/select-one-id Dashboard :public_uuid uuid))]
                   (or (db/exists? DashboardCard
                         :dashboard_id dashboard-id
                         :card_id      card-id)
                       (when-let [dashcard-ids (db/select-ids DashboardCard :dashboard_id dashboard-id)]
                         (db/exists? DashboardCardSeries
                           :card_id          card-id
                           :dashboardcard_id [:in dashcard-ids])))))
  (run-query-for-card-with-id card-id parameters))

(api/defendpoint GET "/oembed"
  "oEmbed endpoint"
  [url format maxheight maxwidth]
  {url       su/NonBlankString
   format    (s/maybe (s/enum "json"))
   maxheight (s/maybe su/IntString)
   maxwidth  (s/maybe su/IntString)}
  (let [height (if maxheight (Integer/parseInt maxheight) default-embed-max-height)
        width  (if maxwidth (Integer/parseInt maxwidth) default-embed-max-width)]
    {:version "1.0"
     :type    "rich"
     :width   width
     :height  height
     :html    (embed-iframe url width height)}))

(api/define-routes)
