(ns metabase.util.urls
  (:require [clojure.string :as s]
            [ring.util.codec :as codec]
            [metabase.public-settings :as public-settings]))

(defn pulse-url
  "Return an appropriate URL for a `Pulse` with ID.

     (pulse-url 10) -> \"http://localhost:3000/pulse#10\""
  [^Integer id]
  (format "%s/pulse#%d" (public-settings/-site-url) id))

(defn dashboard-url
  "Return an appropriate URL for a `Dashboard` with ID.

     (dashboard-url 10) -> \"http://localhost:3000/dash/10\""
  [^Integer id]
  (format "%s/dash/%d" (public-settings/-site-url) id))

(defn card-url
  "Return an appropriate URL for a `Card` with ID.

     (card-url 10) -> \"http://localhost:3000/card/10\""
  [^Integer id]
  (format "%s/card/%d" (public-settings/-site-url) id))

(defn segment-url
  "Return an appropriate URL for a `Segment` with ID.

     (segment-url 10) -> \"http://localhost:3000/admin/datamodel/segment/10\""
  [^Integer id]
  (format "%s/admin/datamodel/segment/%d" (public-settings/-site-url) id))

(defn oembed-url
  "Return an oEmbed URL for the relative path and format

     (oembed-url \"/x\" \"json\") -> \"http://localhost:3000/api/public/oembed?url=x&format=json\""
  [^String relative-url ^String format]
  (str (public-settings/-site-url)
       "/api/public/oembed"
       ;; NOTE: some oEmbed consumers require `url` be the first param???
       "?url="    (codec/url-encode (str (public-settings/-site-url) relative-url))
       "&format=" (codec/url-encode format)))
