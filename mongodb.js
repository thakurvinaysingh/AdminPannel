const mongoose = require("mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/admindata")
.then(()=>{
    console.log('mongoose connected');
})
.catch((e)=>{
    console.log(e);
})
// --------------------//--transaction collection--------------//


// ------------walllet schema --------------------------------//
const walletSchema = new mongoose.Schema({
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    transactions: [{
     type: mongoose.Schema.Types.ObjectId,
      ref:"Transaction"
    }],
  });
const Wallet = mongoose.model('Wallet', walletSchema);
//   ----------transaction -------------------------//
  const transactionSchema = new mongoose.Schema({
    type: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
   
      });
      
const Transaction = mongoose.model('Transaction', transactionSchema);
//   ---------------------------//main collection --------------------//
const logInSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    mobileNo:{
        type:Number,
        require:true

    },
    ShopName: {
        type:String,
        require:false
    },
    OfficeAddress:{
        type:String,
        require:false
    },
    LockAmount:{
       type:Number,
       require:false
    },
    password:{
        type:String,
        require:true
    },
    role:{
        type:String,
        require:true
    },
    image: {
        type: String // store the path to the image
      },
    masteruserID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admintables' 
    },
    ParmanentAddress:{
        type:String,
        require:true
    },
    ParmanentCity:[{
        type:String,
        require:true
    }],
    ParmanentPincode:{
        type:Number,
        require:true
    },
    ParmanentState:{
        type:String,
        require:true
    },
    ParmanentCountry:{
        type:String,
        require:true
    },
    PresentAddress:{
        type:String,
        require:false
    },
    PresentCity:[{
        type:String,
        require:false
    }],
    PresentPincode:{
        type:String,
        require:false
    },
    PresentState:{
        type:String,
        require:false
    },
    PresentCountry:{
        type:String,
        require:false
    },
    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet',
        
    },
    // wallet: {
    //     type: walletSchema,
    //     require:true
    //   },
     
    RechargeServices:{
        type:String,
        require:false
    },
    MoneyServices:{
        type:String,
        require:false
    },
    AepsServices:{
        type:String,
        require:false
    },
    PayoutServices:{
        type:String,
        require:false
    },
    commission: {
        type: Number,
        required: true,
        default: 0,
      }
    

})

const LogInCollection = new mongoose.model('admintables',logInSchema)


 module.exports ={
    LogInCollection,
     Wallet,
     Transaction,
}
//  ---------------------------//

  

//  --- wallet admin-------------//


