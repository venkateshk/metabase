(ns metabase.util.embed
  (:require [hiccup.core :refer [html]]
            [metabase.util.urls :as urls]))

(defn- oembed-link
  "Returns a <link> tag for oEmbed support"
  [url format content-type]
  (html [:link {:rel   "alternate"
                :type  content-type
                :href  (urls/oembed-url url format)
                :title "Metabase"}]))

(defn- embedly-meta
  "Returns a <meta> tag for Embed.ly support"
  []
  (html [:meta {:name "generator", :content "Metabase"}]))

(defn embed-head
  "Returns the <meta>/<link> tags for an embeddable public page"
  [url]
  (str (embedly-meta)
       (oembed-link url "json" "application/json+oembed")))

(defn embed-iframe
  "Returns an <iframe> HTML fragment to embed a public page"
  [url width height]
  (html [:iframe {:src         url
                  :width       width
                  :height      height
                  :frameborder 0}]))
