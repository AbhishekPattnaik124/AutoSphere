const mongoose = require('mongoose');
const Dealerships = require('./dealership');

async function fix() {
  await mongoose.connect('mongodb://localhost:27017/dealershipsDB');
  const dealers = await Dealerships.find({});
  let count = 0;
  for (let dealer of dealers) {
    let updated = false;
    if (dealer.city && dealer.city.includes('?')) {
      dealer.city = dealer.city.replace(/\?/g, '');
      updated = true;
    }
    if (dealer.full_name && dealer.full_name.includes('?')) {
      dealer.full_name = dealer.full_name.replace(/\?/g, '');
      updated = true;
    }
    if (dealer.short_name && dealer.short_name.includes('?')) {
      dealer.short_name = dealer.short_name.replace(/\?/g, '');
      updated = true;
    }
    if (updated) {
      await dealer.save();
      count++;
    }
  }
  console.log(`Fixed ${count} dealers`);
  process.exit(0);
}
fix();
