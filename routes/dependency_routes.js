const express = require("express")
const router = express();
const bodyParser = require('body-parser');
// const { State, City } = require('country-state-city');

router.use(bodyParser.json());

// Parse application/x-www-form-urlencode
router.use(bodyParser.urlencoded({ extended: false }));




const countrydatabase = require('../controllers/country');
//const cityController = require('../controllers/country');

// router.get('/getstate', stateController.getState);
// router.get('/getcity', cityController.getCity);

// Route to fetch all countries
router.get('/api/countries', async (req, res) => {
    try {
      const countries = await countries.find({}, 'name isoCode');
      res.json(countries);
    } catch (err) {
      console.error('Error fetching countries:', err);
      res.status(500).json({ error: 'Error fetching countries' });
    }
  });
  
  // Route to fetch all states of a specific country
  router.get('/api/states/:countryCode', async (req, res) => {
    try {
      const states = await states.find({ country: req.params.countryCode }, 'name isoCode');
      res.json(states);
    } catch (err) {
      console.error('Error fetching states:', err);
      res.status(500).json({ error: 'Error fetching states' });
    }
  });
  
  // Route to fetch all cities of a specific state
  router.get('/api/cities/:stateCode', async (req, res) => {
    try {
      const cities = await cities.find({ state: req.params.stateCode }, 'name');
      res.json(cities);
    } catch (err) {
      console.error('Error fetching cities:', err);
      res.status(500).json({ error: 'Error fetching cities' });
    }
  });
  
  module.exports = router;



