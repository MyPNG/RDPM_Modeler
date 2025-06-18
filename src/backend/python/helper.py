import requests
from lxml import etree
import yaml
import pandas as pd




class Helper:
    @staticmethod
    def get_all_tasks(cpee_url):
        ns = {
            "cpee2": "http://cpee.org/ns/properties/2.0",
            "cpee1": "http://cpee.org/ns/description/1.0"
        }

        # send GET request
        r = requests.get(url=cpee_url)

        # parse XML
        root = etree.fromstring(r.content)
        tasks = root.xpath(".//cpee1:call | .//cpee1:manipulate", namespaces=ns)
        print(f"tasks: {tasks}")

        return tasks

    @staticmethod
    def yaml_log_to_df(path):
        with open(path, "r") as f:
            docs = yaml.safe_load_all(f)
            events = []
            for doc in docs:
                if isinstance(doc, dict) and "event" in doc:
                    event = doc["event"]
                    lifecycle_transition = event.get("cpee:lifecycle:transition", "")

                    if lifecycle_transition in ["activity/calling", "activity/done"]:
                        extracted_event = {
                            "case_id": event["cpee:instance"],
                            "activity": event.get("concept:name", event.get("cpee:activity")),
                            "timestamp": event["time:timestamp"],
                            "lifecycle": "start" if lifecycle_transition == "activity/calling" else "complete",
                            "activity_uuid": event.get("cpee:activity_uuid", ""),
                            "endpoint": event.get("concept:endpoint", ""),
                            "data": event.get("data", [])
                        }

                        # Add resource allocation if available
                        extracted_event["allocated_to"] = Helper.get_resource_allocation(extracted_event["activity"])

                        events.append(extracted_event)
        return pd.DataFrame(events)

    @staticmethod
    def get_resource_allocation(activity_name):
        resource_mapping = {
            "task1": "res2",
            "task2": "res1",
            "task3": "res3",
            "task4": "res4",
            "getResources": "res_sys"
        }
        return resource_mapping.get(activity_name, "unknown")

