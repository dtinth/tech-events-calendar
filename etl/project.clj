(defproject etl "0.1.0-SNAPSHOT"
  :description "Lint and extract event calendar from md to json"
  :url "https://github.com/ThaiProgrammer/tech-events-calendar"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.9.0"]]
  :main ^:skip-aot etl.core
  :target-path "target/%s"
  :plugins [[cider/cider-nrepl "0.16.0"]]
  :profiles {:uberjar {:aot :all}
             :dev {:dependencies [[midje "1.9.1"]]}})

