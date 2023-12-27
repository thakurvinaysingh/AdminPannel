const mongoose = require("mongoose")

// mongoose.connect("mongodb://127.0.0.1:27017/admindata")
// .then(()=>{
//     console.log('mongoose connected-2');
// })
// .catch((e)=>{
//     console.log(e);
// })

const citySchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      required: true,
    },
  });
  
  const City = mongoose.model("City", citySchema);
  module.exports = City;









//const mongoose = require("mongoose");
//const { Country, State, City } = require('country-state-city');

// const citySchema = new mongoose.Schema({
//     Name: {
//         type: String,
//         required: true
//     },
//     state_name: {
//         type: String,
//         required: true
//     }
// });

// const City = mongoose.model('City', citySchema);
// module.exports = City;
