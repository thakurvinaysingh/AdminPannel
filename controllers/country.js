

// const State = require('../models/state');
// const City = require('../models/city');
// const Country = require('../models/countryState');
// const mongoose = require("mongoose")

// // Sample data for countries
// const countriesData = [
//     { name: 'India', isoCode: 'IN' },
//     { name: 'United States', isoCode: 'US' },
//     // Add more countries as needed
//   ];
  
//   // Sample data for states
//   const statesData = [
//     { name: 'Uttar Pradesh', isoCode: 'UP', country: null }, // You can set the country value later
//     { name: 'Maharashtra', isoCode: 'MH', country: null },
//     // Add more states as needed
//   ];
  
//   const citiesData = [
//     { name: 'Lucknow', state: 'UP' },
//     { name: 'Kanpur', state: 'UP' },
   
//     // Add more cities as needed
//   ];
  
//   async function insertData() {
//     try {
//       // Insert countries into the database
//       const Country = await Country.create(countriesData);
  
//       // Set the country reference in the states data
//       statesData.forEach((state) => {
//         state.country = Country.find((country) => country.isoCode === 'IN')._id; // Set the country ID for India
//       });
  
//       // Insert states into the database
//       const State = await State.create(statesData);
  
//       // Set the state reference in the cities data
//       citiesData.forEach((city) => {
//         city.state = State.find((state) => state.name === 'Uttar Pradesh')._id; // Set the state ID for Uttar Pradesh
//       });
  
//       // Insert cities into the database
//       await City.create(citiesData);
  
//       console.log('Data insertion successful!');
//     } catch (err) {
//       console.error('Error inserting data:', err);
//     } finally {
//       mongoose.disconnect();
//     }
//   }
  
//   module.exports = mongoose;
//   console.log(insertData)
//   module.exports={
//     insertData
//   }