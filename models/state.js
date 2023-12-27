const mongoose = require("mongoose")

// mongoose.connect("mongodb://127.0.0.1:27017/admindata")
// .then(()=>{
//     console.log('mongoose connected-1');
// })
// .catch((e)=>{
//     console.log(e);
// })

const stateSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    isoCode: {
        type: String,
        required: true,
        unique: true,
      },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true,
    },
  });
  
  const State = mongoose.model("State", stateSchema);
  module.exports = State;

