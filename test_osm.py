import requests

query = """
[out:json];
node["shop"="car"](28.5,77.0,28.7,77.3);
out 5;
"""
headers = {'User-Agent': 'AutoSphere/1.0'}
res = requests.post('https://overpass-api.de/api/interpreter', data=query, headers=headers)
print(res.text)
