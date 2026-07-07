const mongoose = require('mongoose');
const MONGO_URL = 'mongodb://localhost:27017/inventoryDB';
async function dropDB() {
  try {
    await mongoose.connect(MONGO_URL);
    await mongoose.connection.db.collection('cars').drop();
    console.log("Cars collection dropped successfully");
  } catch (e) {
    console.log(e);
  } finally {
    process.exit(0);
  }
}
dropDB();
