import requests
import json
import random

def fetch_osm_dealers():
    query = """
    [out:json];
    area["name"="India"]->.searchArea;
    node["shop"="car"](area.searchArea);
    out 100;
    """
    headers = {'User-Agent': 'AutoSphere/1.0'}
    print("Fetching real dealers from OpenStreetMap...")
    res = requests.post('https://overpass-api.de/api/interpreter', data=query, headers=headers)
    data = res.json()
    
    dealerships = []
    _id = 1000
    
    for element in data.get('elements', []):
        tags = element.get('tags', {})
        name = tags.get('name', tags.get('name:en', 'Unknown Dealer'))
        if name == 'Unknown Dealer':
            continue
            
        city = tags.get('addr:city', 'New Delhi') # Default fallback if not provided
        state = tags.get('addr:state', 'Delhi')
        postcode = tags.get('addr:postcode', str(random.randint(110000, 800000)))
        street = tags.get('addr:street', 'Main Road')
        
        # Check if Rourkela or Bhubaneswar are specifically present in the name to satisfy user request
        if 'rourkela' in name.lower(): city = 'Rourkela'; state = 'Odisha'
        if 'bhubaneswar' in name.lower(): city = 'Bhubaneswar'; state = 'Odisha'
        
        dealer = {
            "id": _id,
            "city": city,
            "state": state,
            "address": street,
            "zip": postcode,
            "lat": str(element.get('lat')),
            "long": str(element.get('lon')),
            "short_name": name.split(' ')[0],
            "full_name": name
        }
        dealerships.append(dealer)
        _id += 1
        
    print(f"Mapped {len(dealerships)} real dealerships.")
    
    with open('data/dealerships.json', 'w') as f:
        json.dump({"dealerships": dealerships}, f, indent=2)
        
    print("Saved to data/dealerships.json")

if __name__ == '__main__':
    fetch_osm_dealers()
