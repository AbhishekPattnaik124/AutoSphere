const mongoose = require('mongoose');

const MONGO_URL = 'mongodb://localhost:27017/dealershipsDB';

async function dropDB() {
  try {
    await mongoose.connect(MONGO_URL);
    await mongoose.connection.db.collection('dealerships').drop();
    console.log("Dealerships collection dropped successfully");
  } catch (e) {
    console.log(e);
  } finally {
    process.exit(0);
  }
}
dropDB();
