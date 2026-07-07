const fs = require('fs');

const dataPath = 'data/dealerships.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 1. Assign 'India' to existing dealers
data.dealerships = data.dealerships.map(d => {
    if (!d.country) d.country = "India";
    return d;
});

// 2. Add some international dealers
let nextId = Math.max(...data.dealerships.map(d => d.id)) + 1;

const newDealers = [
    {
        "id": nextId++,
        "city": "Los Angeles",
        "state": "California",
        "country": "USA",
        "address": "123 Beverly Hills",
        "zip": "90210",
        "lat": "34.0736",
        "long": "-118.4004",
        "short_name": "Lexus LA",
        "full_name": "Lexus of Los Angeles"
    },
    {
        "id": nextId++,
        "city": "San Francisco",
        "state": "California",
        "country": "USA",
        "address": "456 Bay Area",
        "zip": "94105",
        "lat": "37.7749",
        "long": "-122.4194",
        "short_name": "SF Motors",
        "full_name": "San Francisco Premium Motors"
    },
    {
        "id": nextId++,
        "city": "New York",
        "state": "New York",
        "country": "USA",
        "address": "789 Manhattan Ave",
        "zip": "10001",
        "lat": "40.7128",
        "long": "-74.0060",
        "short_name": "Manhattan Auto",
        "full_name": "Manhattan Luxury Auto"
    },
    {
        "id": nextId++,
        "city": "London",
        "state": "England",
        "country": "UK",
        "address": "10 Downing St Area",
        "zip": "SW1A 2AA",
        "lat": "51.5074",
        "long": "-0.1278",
        "short_name": "London JLR",
        "full_name": "London Jaguar Land Rover"
    },
    {
        "id": nextId++,
        "city": "Manchester",
        "state": "England",
        "country": "UK",
        "address": "Old Trafford Area",
        "zip": "M16 0RA",
        "lat": "53.4808",
        "long": "-2.2426",
        "short_name": "Mancunian Motors",
        "full_name": "Manchester Elite Motors"
    },
    {
        "id": nextId++,
        "city": "Sydney",
        "state": "New South Wales",
        "country": "Australia",
        "address": "Sydney Opera Area",
        "zip": "2000",
        "lat": "-33.8688",
        "long": "151.2093",
        "short_name": "Sydney Premium",
        "full_name": "Sydney Premium Auto"
    }
];

data.dealerships.push(...newDealers);

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log(`Added ${newDealers.length} international dealers and set India for existing ones.`);
