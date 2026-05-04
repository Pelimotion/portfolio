import urllib.request
import json
import ssl
from urllib.parse import quote

API_KEY = "864ea13e-6fa0-4de2-aedddb2e0480-84d2-439a"
ZONE_NAME = "pelimotion-portfolio"

def api_get(path):
    url = "https://storage.bunnycdn.com/" + quote(ZONE_NAME + path)
    headers = {
        "AccessKey": API_KEY,
        "accept": "application/json"
    }
    req = urllib.request.Request(url, headers=headers)
    context = ssl._create_unverified_context()
    try:
        with urllib.request.urlopen(req, context=context) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        return str(e)

print("Root items:")
print(json.dumps(api_get("/"), indent=2))
