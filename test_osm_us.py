import requests
import json

query = """
[out:json];
area["ISO3166-1"="US"][admin_level=2]->.searchArea;
node["shop"="car"](area.searchArea);
out 20;
"""
headers = {'User-Agent': 'AutoSphere/1.0'}
res = requests.post('https://overpass-api.de/api/interpreter', data=query, headers=headers)
print(json.dumps(res.json(), indent=2))
