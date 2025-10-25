import json, os, boto3
_S3 = boto3.client("s3"); _CACHE = {"data": None}
def load_attack_meta():
    if _CACHE["data"] is not None: return _CACHE["data"]
    obj = _S3.get_object(Bucket=os.environ["ATTACK_S3_BUCKET"], Key=os.environ["ATTACK_S3_KEY"])
    data = json.loads(obj["Body"].read())
    techniques = {}
    for o in data.get("objects", []):
        if o.get("type") == "attack-pattern" and not o.get("x_mitre_deprecated", False):
            tech_id = None
            for ext in o.get("external_references", []):
                if ext.get("source_name") == "mitre-attack":
                    tech_id = ext.get("external_id"); break
            if not tech_id: continue
            name = o.get("name")
            tactics = [p.get("phase_name","").title().replace("-", " ") for p in o.get("kill_chain_phases", [])]
            techniques[tech_id] = {"name": name, "tactics": tactics}
    _CACHE["data"] = techniques
    return techniques

