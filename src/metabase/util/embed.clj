(ns metabase.util.embed
  (:require [hiccup.core :refer [html]]
            [metabase.util.urls :as urls]))

(defn- oembed-link
  [url format content-type]
  (html [:link {:rel   "alternate"
                :type  content-type
                :href  (urls/oembed-url url format)
                :title "Metabase"}]))

(defn- embedly-meta
  []
  (html [:meta {:name "generator" :content "Metabase"}]))

(defn embed-head
  [url]
  (str (embedly-meta)
       (oembed-link url "json" "application/json+oembed")))

(defn embed-iframe
  [url width height]
  (html [:iframe {:src         url
                  :width       width
                  :height      height
                  :frameborder 0}]))
