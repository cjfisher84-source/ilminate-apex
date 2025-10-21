import json
from attack_meta import load_attack_meta
from rules import map_event
def _resp(status, body):
    return {"statusCode": status, "headers": {"Content-Type":"application/json","Access-Control-Allow-Origin":"*"}, "body": json.dumps(body)}
def handler(event, context):
    try:
        body = event.get("body")
        if body and isinstance(body, str): body = json.loads(body)
        elif body is None: body = event
        text = (body or {}).get("text","")
        mappings = map_event(text)
        meta = load_attack_meta()
        for m in mappings:
            tmeta = meta.get(m["id"])
            if tmeta:
                m["name"] = tmeta["name"]
                m["tactics_all"] = tmeta["tactics"]
        return _resp(200, {"ok": True, "event_id": body.get("event_id"), "techniques": mappings})
    except Exception as e:
        return _resp(500, {"ok": False, "error": str(e)})

