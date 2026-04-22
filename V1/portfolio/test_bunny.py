import urllib.request
import json
import ssl
from urllib.parse import quote

URL = "https://storage.bunnycdn.com/pelimotion-assets/" + quote("Medias Portfolio") + "/"
HEADERS = {
    "AccessKey": "9268ef2d-28c0-4827-a29127346d24-5d2b-47a1",
    "accept": "application/json"
}

req = urllib.request.Request(URL, headers=HEADERS)
context = ssl._create_unverified_context()
try:
    with urllib.request.urlopen(req, context=context) as response:
        print(response.status)
        data = json.loads(response.read().decode('utf-8'))
        print(json.dumps(data[:3], indent=2))
        print("Total files/folders:", len(data))
except Exception as e:
    print(e)
