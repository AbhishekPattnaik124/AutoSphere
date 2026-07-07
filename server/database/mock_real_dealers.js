const fs = require('fs');

const realDealers = {
  "dealerships": [
    {
      "id": 1,
      "city": "Rourkela",
      "state": "Odisha",
      "address": "Ring Rd, Udit Nagar",
      "zip": "769012",
      "lat": "22.2359",
      "long": "84.8622",
      "short_name": "Maruti",
      "full_name": "Maruti Suzuki ARENA (Jyote Motors, Rourkela)"
    },
    {
      "id": 2,
      "city": "Rourkela",
      "state": "Odisha",
      "address": "Panposh Road",
      "zip": "769004",
      "lat": "22.2291",
      "long": "84.8236",
      "short_name": "Tata",
      "full_name": "Tata Motors Cars Showroom - Trupti Automotives"
    },
    {
      "id": 3,
      "city": "Bhubaneswar",
      "state": "Odisha",
      "address": "Cuttack Rd, Rasulgarh",
      "zip": "751010",
      "lat": "20.2872",
      "long": "85.8398",
      "short_name": "Hyundai",
      "full_name": "Utkal Hyundai, Rasulgarh"
    },
    {
      "id": 4,
      "city": "Bhubaneswar",
      "state": "Odisha",
      "address": "Pahal, NH-16",
      "zip": "752101",
      "lat": "20.3168",
      "long": "85.8776",
      "short_name": "Kia",
      "full_name": "Gargson Kia Bhubaneswar"
    },
    {
      "id": 5,
      "city": "Mumbai",
      "state": "Maharashtra",
      "address": "Link Road, Andheri West",
      "zip": "400053",
      "lat": "19.1363",
      "long": "72.8277",
      "short_name": "Audi",
      "full_name": "Audi Mumbai West"
    },
    {
      "id": 6,
      "city": "New Delhi",
      "state": "Delhi",
      "address": "Okhla Industrial Estate",
      "zip": "110020",
      "lat": "28.5273",
      "long": "77.2796",
      "short_name": "Mercedes",
      "full_name": "T&T Motors - Mercedes-Benz"
    },
    {
      "id": 7,
      "city": "Bangalore",
      "state": "Karnataka",
      "address": "Hosur Road",
      "zip": "560068",
      "lat": "12.9103",
      "long": "77.6258",
      "short_name": "BMW",
      "full_name": "Navnit Motors BMW Bangalore"
    }
  ]
};

fs.writeFileSync('data/dealerships.json', JSON.stringify(realDealers, null, 2));
console.log("Written real dealerships to data/dealerships.json");
