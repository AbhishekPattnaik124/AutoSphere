const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data/car_records.json', 'utf8'));

// The OSM dealers have IDs starting from 1000, e.g., 1000 to 1098.
data.cars = data.cars.map(car => {
    // Randomize the dealer_id to fall within the new range
    car.dealer_id = Math.floor(Math.random() * 99) + 1000;
    return car;
});

fs.writeFileSync('data/car_records.json', JSON.stringify(data, null, 2));
console.log('Updated car_records.json to match new OSM dealer IDs (1000-1099).');
