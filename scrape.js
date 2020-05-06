const moment = require('moment');
moment().format();

// Import internal data and components
const scrape = require('./qcScraper');
const scrapeCanada = require('./caScraper');
const data = require('./src/data');
// Destructuring data from internal component
const { pageURL } = data; // This is the Quebec government's page URL for the scraper
const { canadaURL } = data; // This is the Canada government's page URL for the scraper
const { mongoURI } = data; // This is the MongoDB connection URI

console.log('pageURL', pageURL);
console.log('canadaURL', canadaURL);
console.log('mongoURI', mongoURI);

// Connect to MongoDB
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// DB object to be used by MongoDB
let db;

// Database Name
const dbName = 'qc-coronavirus-cases';

// Create a new MongoClient
const client = new MongoClient(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Use connect method to connect to the Server
client.connect(function (err) {
  assert.equal(null, err);
  console.log('Connected successfully to MongoDB server');

  db = client.db(dbName);
});

// Get data and update DB
async function getQcData() {
  // Get data from scraper
  const qcData = await scrape(pageURL);

  // Assign each data to a variable
  const today = qcData.date;
  const total = qcData.total;
  const regions = qcData.regions;
  const casesByAge = qcData.casesByAge;
  const tests = qcData.testsArray;
  const hospitalizations = qcData.hospListArray;
  const deaths = qcData.deaths;
  const deathsByRegion = qcData.deathsByRegion;
  const deathsByAge = qcData.deathsByAge;

  if (!isNaN(qcData.total) && qcData.testsArray.length === 3) {
    // Function to get the documents collections and update the DB
    async function updateCollection(collection, data) {
      const collectionToUpdate = db.collection(collection);

      console.log(`Writing ${JSON.stringify(data)} to ${collection}`);

      await collectionToUpdate.updateOne(
        { date: today },
        { $set: { date: today, data } },
        { upsert: true }
      );
    }

    // Update every collection in the DB
    await updateCollection('totalCasesPerDay', total);
    await updateCollection('casesByRegion', regions);
    await updateCollection('casesByAgeGroup', casesByAge);
    await updateCollection('tests', tests);
    await updateCollection('hospitalization', hospitalizations);
    await updateCollection('totalDeaths', deaths);
    await updateCollection('deathsByRegion', deathsByRegion);
    await updateCollection('deathsByAge', deathsByAge);

    console.log('Quebec data updated in DB');
  } else {
    console.log('Quebec scraper returned no data. Nothing written to DB.');
  }
}

// Get Canada data and update DB
async function getCaData() {
  // Get data from scraper
  const caData = await scrapeCanada(canadaURL);

  // Gets today's date in YYYY-MM-DD format
  const today = moment().format('YYYY-MM-DD');

  if (!isNaN(caData.tested) && Object.keys(caData).length === 4) {
    async function updateCollection(collection, data) {
      const collectionToUpdate = db.collection(collection);

      console.log(`Writing ${JSON.stringify(data)} to ${collection}`);

      await collectionToUpdate.updateOne(
        { date: today },
        { $set: { date: today, data } },
        { upsert: true }
      );
    }

    await updateCollection('canadaData', caData);
    console.log('Canada data updated in DB');
  } else {
    console.log('Canada scraper returned no data. Nothing written to DB.');
  }
}

(async function () {
  try {
    await getQcData();
    await getCaData();
  } catch (e) {
    const error = JSON.stringify(e);
    console.log(error);
  }
})();
