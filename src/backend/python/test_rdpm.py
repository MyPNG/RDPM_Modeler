from bottle import route, run, request, response, HTTPError, hook
import json
import requests
from helper import Helper
import glob
import pandas as pd
import pm4py
from pm4py.objects.conversion.log import converter as log_converter
from pm4py.objects.log.util.dataframe_utils import Parameters
from pm4py.objects.log.importer.xes import importer as xes_importer
from bottle import route, response

# testing the route
@route('/')
def home():
    return "Server läuft!"

@hook('after_request')
def enable_cors():
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = (
        'Origin, Accept, Content-Type, X-Requested-With, '
        'X-CSRF-Token, Cpee-Instance-Url'
    )

@route('/performanceData', method='OPTIONS')
def preflight():
    return

@route('/getResources', method='OPTIONS')
def preflight():
    return

_tasks= []
@route('/getResources', method='GET')
def resources_api_connect():
    global _tasks
    instance_url = request.headers.get("Cpee-Instance-Url")

    print(f"request header: {request.headers}")

    ns = {"cpee2": "http://cpee.org/ns/properties/2.0",
          "cpee1": "http://cpee.org/ns/description/1.0"}

    if not instance_url:
        raise HTTPError(400, "Missing Cpee-Instance-Url header")

    description_url = instance_url.rstrip("/") + "/properties/description/"

    resp = requests.get(description_url)
    print(f"description_url: {description_url}")
    resp.raise_for_status()

    tasklabels = []
    # tasklabels.append({"cpee_instance_url": instance_url.rstrip("/")})
    for task in Helper.get_all_tasks(description_url):
        try:
            # works on "manipulate elem"
            tasklabels.append({"task_id": task.attrib["id"], "label": task.attrib["label"]})
        except:
            try:
                attrib = task.find(".//cpee1:parameters", ns)
                if not attrib.find(".//cpee1:label", ns).text:
                    raise Exception("Task {} has no label.".format(task.attrib["id"]))
                else:
                    tasklabels.append({"task_id": task.attrib["id"], "label": attrib.find(".//cpee1:label", ns).text})
            except Exception as e:
                print(e)
                continue

    _tasks = tasklabels
    response.content_type = 'application/json'
    print("Tasklabels: ", json.dumps(tasklabels))
    # Filter out the "getResources" task, collect other task labels
    task_names = [t["label"] for t in tasklabels if t["label"] != "getResources"]

    # Build the URL for Node.js API call
    tasks_param = ",".join(task_names)
    api_url = f"http://localhost:5001/api/resources/byTasks?tasks={tasks_param}"

    # Make the GET request to Node.js API
    api_resp = requests.get(api_url)

    if api_resp.status_code != 200:
        raise HTTPError(api_resp.status_code, f"Error from resources API: {api_resp.text}")

    response.content_type = "application/xml"
    print("Available resources: ", api_resp.text)
    return api_resp.text

@route('/tasks', method='GET')
def get_cached_tasks():
    response.content_type = 'application/json'
    print(f"tasks_cache: {_tasks}")
    return json.dumps(_tasks)


@route('/performanceData', method='GET')
def get_performance_data():
    # Liste aller .xes-Dateien in performanceData/
    xes_paths = glob.glob("performanceData/*.xes")

    if xes_paths:
        # Mindestens eine .xes-Datei gefunden → alle .xes nacheinander parsen ---
        dfs = []
        for xes_path in xes_paths:
            try:
                log = xes_importer.apply(xes_path)
                df_temp = pm4py.convert_to_dataframe(log)
                dfs.append(df_temp)
            except Exception as e:
                # Falls ein einzelnes XES fehlerhaft ist, überspringe es und protokolliere
                print(f"Warnung: Konnte '{xes_path}' nicht einlesen: {e}")

        if not dfs:
            # Alle .xes-Dateien waren ungültig → leere Antwort
            response.content_type = "application/json"
            return {"data": []}

        # Führe alle DataFrames zusammen
        df = pd.concat(dfs, ignore_index=True)

    else:
        # Keine .xes gefunden -> YAML
        dfs_yaml = []
        for fn in glob.glob("performanceData/*.xes.yaml"):
            try:
                df_tmp = Helper.yaml_log_to_df(fn)
                dfs_yaml.append(df_tmp)
            except Exception as e:
                print(f"Warnung: Fehler beim Parsen von '{fn}': {e}")

        if not dfs_yaml:
            # Weder .xes noch .xes.yaml gefunden → leere Antwort
            response.content_type = "application/json"
            return {"data": []}

        # Alle YAML-DataFrames zusammenführen
        log_df = pd.concat(dfs_yaml, ignore_index=True)
        log_df["timestamp"] = pd.to_datetime(log_df["timestamp"])
        log_df = log_df.sort_values(["case_id", "timestamp"])

        # In eine kombinierte XES-Datei schreiben
        event_log = log_converter.apply(
            log_df,
            parameters={
                Parameters.CASE_ID_KEY: "case_id",
                Parameters.ACTIVITY_KEY: "activity",
                Parameters.TIMESTAMP_KEY: "timestamp",
                "lifecycle:transition": "lifecycle",
                "org:resource": "allocated_to"
            }
        )
        pm4py.write_xes(event_log, "enhanced_combined.xes")
        print("enhanced_combined.xes created.")

        # Jetzt die neue XES-Datei oder eine vorhandene enhanced_combined.xes einlesen
        log = xes_importer.apply("enhanced_combined.xes")
        df = pm4py.convert_to_dataframe(log)

    if "activity_uuid" not in df.columns:
        df = df.sort_values(["case_id", "activity", "allocated_to", "timestamp"])
        grp_count = df.groupby(
            ["case_id", "activity", "allocated_to"]
        ).cumcount()
        pair_index = (grp_count // 2).astype(int)
        df["activity_uuid"] = (
            df["case_id"].astype(str)
            + "_"
            + df["activity"].astype(str)
            + "_"
            + df["allocated_to"].astype(str)
            + "_"
            + pair_index.astype(str)
        )

    df = df[df["lifecycle"].isin(["start", "complete"])]

    try:
        pivot = df.pivot_table(
            index="activity_uuid",
            columns="lifecycle",
            values="timestamp",
            aggfunc="first"
        ).reset_index()
    except KeyError:
        response.content_type = "application/json"
        return {"data": []}

    pivot["duration"] = (pivot["complete"] - pivot["start"]).dt.total_seconds()

    meta = df.drop_duplicates(subset=["activity_uuid"])[
        ["activity_uuid", "case_id", "activity", "allocated_to"]
    ]
    perf = pd.merge(meta, pivot, on="activity_uuid")
    perf["duration"] = perf["duration"].fillna(0)

    def ts_to_iso(x):
        if pd.isna(x):
            return None
        return x.isoformat()

    perf["start"] = perf["start"].apply(ts_to_iso)
    perf["complete"] = perf["complete"].apply(ts_to_iso)

    records = perf.rename(columns={"allocated_to": "resource"}).to_dict(orient="records")

    response.content_type = "application/json"
    return {"data": records}


run(host='localhost', port=5002)

