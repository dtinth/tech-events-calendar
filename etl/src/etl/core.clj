(ns etl.core
  (:require [clojure.spec.alpha :as s]
            [clojure.string :as str])
  (:gen-class))

(defn -main
  "I don't do a whole lot ... yet."
  [& args]
  (println "Hello, World!"))

(defn split-line
  [text]
  (str/split text #"\n"))

(defn tokenize
  [lines]
  (->> lines (map #(str/split % #" "))))

;; spec

(def month?
  #{"January"
    "February"
    "March"
    "April"
    "May"
    "June"
    "July"
    "August"
    "September"
    "October"
    "November"
    "December"})

(def year? #(re-matches #"20(1[8-9]|[2-9][0-9])" %))
(def date? #(re-matches #"[1-9]|1[0-9]|2[0-9]|3[0-1]" %))
(def day? #{"Mon" "Tue" "Wed" "Thu" "Fri" "Sat" "Sun"})

(def range-symbol? #{"~"})
(def empty-line? #{[""]})

(def month-and-year
  (s/cat
    :header-mark #{"##"}
    :month month?
    :year year?))

(def date-and-title
  (s/cat
    :header-mark #{"###"}
    :date (s/alt :single date?
                 :range (s/cat :start date?
                               :range-symbol range-symbol?
                               :end date?))
    :open-paren #{"("}
    :day (s/alt :single day?
                :range (s/cat :start day?
                              :range-symbol range-symbol?
                              :end day?))
    :close-paren #{")"}
    :colon #{":"}
    :title (s/* string?)))


(defn detach-parens-and-colon
  [tokenized]
  (mapcat #(->> (seq %)
                (partition-by #{\( \) \:})
                (map str/join))
          tokenized))

(s/def ::calendar
  (s/*
    (s/cat
      :month-and-year (s/spec month-and-year)
      :events (s/*
               (s/cat :header (s/and (s/conformer detach-parens-and-colon)
                                     (s/spec date-and-title))
                      :desc (s/* vector?))))))

(def start-mark "[start-calendar]: #")
(def end-mark "[end-calendar]: #")

(->> (slurp "../README.md")
     (split-line)
     (drop-while (partial not= start-mark))
     (rest)
     (take-while (partial not= end-mark))
     (filter (complement #{""}))
     (tokenize)
     (s/conform ::calendar))

