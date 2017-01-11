(ns metabase.routes
  (:require [clojure.java.io :as io]
            [cheshire.core :as json]
            (compojure [core :refer [context defroutes GET]]
                       [route :as route])
            [ring.util.response :as resp]
            [stencil.core :as stencil]
            [metabase.api.routes :as api]
            [metabase.public-settings :as public-settings]
            [metabase.util :as u]))

(defn- index [_]
  (-> (if ((resolve 'metabase.core/initialized?))
        (stencil/render-string (slurp (or (io/resource "frontend_client/index.html")
                                          (throw (Exception. "Cannot find './resources/frontend_client/index.html'. Did you remember to build the Metabase frontend?"))))
                               {:bootstrap_json (json/generate-string (public-settings/public-settings))})
        (slurp (io/resource "frontend_client/init.html")))
      resp/response
      (resp/content-type "text/html; charset=utf-8")))

(defroutes ^:private public-download-routes
  (GET ["/:uuid.csv"  :uuid u/uuid-regex] [uuid] (resp/redirect (format "/api/public/card/%s/csv"  uuid)))
  (GET ["/:uuid.json" :uuid u/uuid-regex] [uuid] (resp/redirect (format "/api/public/card/%s/json" uuid))))

;; Redirect naughty users who try to visit a page other than setup if setup is not yet complete
(defroutes ^{:doc "Top-level ring routes for Metabase."} routes
  ;; ^/$ -> index.html
  (GET "/" [] index)
  (GET "/favicon.ico" [] (resp/resource-response "frontend_client/favicon.ico"))
  ;; ^/api/ -> API routes
  (context "/api" [] api/routes)
  ; ^/app/ -> static files under frontend_client/app
  (context "/app" []
    (route/resources "/" {:root "frontend_client/app"})
    ;; return 404 for anything else starting with ^/app/ that doesn't exist
    (route/not-found {:status 404
                      :body "Not found."}))
  ;; ^/public/question/ -> Public question JSON & CSV download routes
  (context "/public/question" [] public-download-routes)
  ;; Anything else (e.g. /user/edit_current) should serve up index.html; React app will handle the rest
  (GET "*" [] index))
