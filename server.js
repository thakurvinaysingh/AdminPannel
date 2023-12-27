
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

//import fetch from 'node-fetch';

// Importing Libraies that we installed using npm
const express = require("express")
const fetch = require("node-fetch")
const mongoose = require("mongoose")  
const app = express();
const multer = require('multer');
const bcrypt = require("bcrypt") // Importing bcrypt package
const passport = require("passport")
const initializePassport = require("./passport-config")
const flash = require("express-flash")
const path = require("path");
const session = require("express-session")
const methodOverride = require("method-override")
const {LogInCollection,Wallet,Transaction } = require("./mongodb");


const randomstring = require('randomstring');
const nodemailer = require('nodemailer');
const bodyParser = require("body-parser");
const router = require('./routes/dependency_routes');
const {Country,State,City}= require('country-state-city')
//console.log(City.getCitiesOfCountry('IN'));



//console.log(Country.getAllCountries())
// initializePassport(
//     passport,
//     async (identifier) => await LogInCollection.findOne({ identifier }).exec());
    // passport,
    // email => users.find(user => user.email === eamil),
    // id => users.find(user => user.id === id)
    // )

    // Assuming you have a LogInCollection model for user authentication.


const getUserByIdentifier = async (identifier) => {
    try {
      // Find the user by email
      const userByEmail = await LogInCollection.findOne({ email: identifier }).exec();
      if (userByEmail) {
        return userByEmail;
      }
  
      // Find the user by name
      const userByName = await LogInCollection.findOne({ name: identifier }).exec();
      if (userByName) {
        return userByName;
      }
  
      // If no user is found with the given identifier, return null
      return null;
    } catch (error) {
      console.error('Error fetching user by identifier:', error);
      return null;
    }
  };
  
  // Call initializePassport with the modified getUserByIdentifier function
  
initializePassport(passport, getUserByIdentifier);
  

const views = path.join(__dirname, '/views')
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', views);

const user = []

app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false, // We wont resave the session variable if nothing is changed
    saveUninitialized: false,
    cookie: {
      maxAge: 1000  * 60 * 15 // Session expires after 15 minutes of inactivity
  }

}))
app.use(passport.initialize()) 
app.use(passport.session())
app.use(methodOverride("_method"))

///----------------------------------------//
// app.get('/index',checkAuthenticated,(req,res)=>{
//     res.render("index.ejs");
// })
//app.use('/api', router);


app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render("login.ejs")
})

app.get('/RechargeServices', checkAuthenticated, checkServicesStatus,noCache, (req, res) => {
  // Access the servicesStatus property to check the status of individual services
  if (req.servicesStatus.RechargeServicesLink) {
    const user = req.user
    res.render('RechargeServices.ejs',{user:user});
  } else {
    res.send('Recharge services are inactive.');
  }
});
app.get('/RechargeServices1', checkAuthenticated, checkServicesStatus,noCache, (req, res) => {
  // Access the servicesStatus property to check the status of individual services
  if (req.servicesStatus.RechargeServicesLink) {
    const user = req.user
    res.render('RechargeServices1.ejs',{user:user});
  } else {
    res.send('Recharge services are inactive.');
  }
});
app.get('/MoneyServices', checkAuthenticated,checkServicesStatus,noCache, (req, res) => {
  if(req.servicesStatus.MoneyServicesLink){
    const user = req.user
    res.render("MoneyServices.ejs",{user:user})
  }else{
    res.send('Rechage services are inactive.')
  }
});
app.get('/AepsServices', checkAuthenticated,checkServicesStatus,noCache, (req, res) => {
  if(req.servicesStatus.AepsServicesLink){
    const user = req.user
    res.render("AepsServices.ejs",{user:user})
  }else{
    res.send('Services is not active')
  }
});
app.get('/PayoutServices', checkAuthenticated,checkServicesStatus,noCache, (req, res) => {
  if(req.servicesStatus.PayoutServicesLink){
    const user = req.user
    res.render("PayoutServices.ejs",{user:user})
  }else{
    res.send('services is Inactive')
  }
});

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render("register.ejs")
})


app.delete("/logout", (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err)
        res.redirect("/")
    })
   
})


// Configuring the register post functionality
app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}))

// Configuring the register post functionality
// app.post("/register", checkNotAuthenticated, async (req, res) => {

//     try {
//         const hashedPassword = await bcrypt.hash(req.body.password, 10)
//         users.push({
//             id: Date.now().toString(), 
//             name: req.body.name,
//             email: req.body.email,
//             password: hashedPassword,
//             role: req.body.role, // new code 
//         })
//         console.log(users); // Display newly registered in the console
//         res.redirect("/login")
        
//     } catch (e) {
//         console.log(e);
//         res.redirect("/register")
//     }
// })
app.post('/register',checkNotAuthenticated, async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const data = {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        role: req.body.role
    }
    const check = await LogInCollection.findOne({ email: req.body.email })

    try {
        if (check) {
            const passwordMatch = await bcrypt.compare(req.body.password, check.password);
            if (passwordMatch) {
                req.flash('error', 'User details already exist');
                res.redirect('/register');
            } else {
                req.flash('error', 'Email is already registered with a different password');
                res.redirect('/register');
            }

        } else {
            await LogInCollection.insertMany([data])
            res.render("login")
        }
    } catch (error) {
        console.log(error);
    }

})

// Routes
// if (!user.wallet) {
//   return res.status(500).send('User does not have a wallet reference.');
// }
// const wallet = await Wallet.findById(user.wallet).populate('transactions');
// if (!wallet) {
//   return res.status(500).send('Wallet not found.');
// }
// const transactions = wallet.transactions || [];
// res.render('Transaction.ejs', { transactions,imagePath: imagePath,user:user  });

app.get('/', checkAuthenticated,noCache,async (req, res) => {
    // res.render("index.ejs", {name: req.user.name}) old code
    // Check the user's role and render the appropriate view
    const services = {
      RechargeServicesLink: req.user.RechargeServices,
      MoneyServicesLink: req.user.MoneyServices,
      AepsServicesLink: req.user.AepsServices,
      PayoutServicesLink: req.user.PayoutServices,
  };
  const user = req.user
  userwallet = await LogInCollection.findById(req.user).populate('wallet'); 
  const wallet = await Wallet.findById(user.wallet).populate('transactions'); 
  const transactions = wallet.transactions || [];
  const imagePath = user ? user.image : null;
  if (req.user.role === "user") {
    res.render('index', {
         name: req.user.name,
         email: req.user.email,
         services: services,
         transactions:transactions 
         });
  } else if (req.user.role === "admin") {
    const user = req.user  
     userwallet = await LogInCollection.findById(req.user).populate('wallet');  
    const imagePath = user ? user.image : null; 
    res.render("admin", { user:user,
      imagePath: imagePath ,
      services: services,
      userwallet :userwallet,
      transactions:transactions 

     });
    
  } else if (req.user.role === "super-distributor") {
    res.render("super-distributor.ejs", { user:user,
      imagePath: imagePath ,
      services: services, 
      userid:req.user._id,
      userwallet :userwallet,
      transactions:transactions 
     });
  } else if (req.user.role === "distributor") {
    res.render("distributor-home.ejs", { user:user,
      imagePath: imagePath ,
      userwallet :userwallet,
      services: services,
      transactions:transactions 
      });
  } else if (req.user.role === "retailer") {
    res.render("retailer-home.ejs", { user:user,
      imagePath: imagePath ,
      userwallet :userwallet,
      services: services,
      transactions:transactions   
    });
  } else {
    res.render("login.ejs")
  }

})

app.get('/forgetpassword',(req, res) => {
    res.render("forget-Password.ejs")
})
//---------------------------reset Password---------------///
app.post("/resetpassword", async (req, res) => {
    const email = req.body.email;
  
    try {
      const user = await LogInCollection.findOne({ email }).exec();
      if (user) {
        const newPassword = randomstring.generate({
          length: 10,
          numbers: true,
          symbols: false,
          uppercase: true,
          strict: true
        });
  
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
    console.log(hashedPassword);
        await user.save();
  
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: 'vinay.singh5497@gmail.com',
            pass: 'bcackyyamyacslqa'
          }
        });
  
        const message = {
          from: "vinay.singh5497@gmail.com",
          to: email,
          subject: "Password Reset",
          // text: `Your new password is: ${newPassword}`
          html: `
          <h3>Hello</h3>
          <p>Email:${req.body.email}</p>
          <p>Your new Password :</p>
          <p>Password:${newPassword}</p>
        
          <p>Please keep your account details secure.</p>
          <p>Please Login Your new Password </p>
        `,
        };
  
        transporter.sendMail(message, (error, info) => {
          if (error) {
            console.log("Error sending email:", error);
          } else {
            console.log("Email sent:", info.response);
          }
        });
  
        req.flash("error", "Password reset successful. Check your email for the new password. ");
        res.redirect("/forgetpassword");
      } else {
        req.flash("error", "User not found Try Again");
        res.redirect("/forgetpassword");
      }
    } catch (error) {
      console.log(error);
      req.flash("error", "An error occurred");
      res.redirect("/forgotpassword");
    }
  });

  // ----------------------rest pasword--------------------------//
  function checkAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
      return next();
    }
    res.redirect('/'); // Redirect to the login page if the user is not an admin
  }

  function noCache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
}


function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect("/")
    }
    next()
}

//--------------------Active or inactive ---------//
function isServiceActive(service) {
  return service === 'active';
}

function checkServicesStatus(req, res, next) {
  const services = {
    RechargeServicesLink: req.user.RechargeServices,
    MoneyServicesLink: req.user.MoneyServices,
    AepsServicesLink: req.user.AepsServices,
    PayoutServicesLink: req.user.PayoutServices,
  };

  const servicesStatus = {};
  for (const [serviceName, status] of Object.entries(services)) {
    servicesStatus[serviceName] = isServiceActive(status);
  }

  req.servicesStatus = servicesStatus;
  next();
}
// --------RD----------------ReadDAta------------------RD--------------//
app.get('/ReadData',checkAuthenticated,noCache, async (req, res) => {
  const user = req.user
    try {
      if(user.role === 'admin'){
      const users = await LogInCollection.find().exec();
      const imagePath = user ? user.image : null;
      res.render("ReadData", { users: users || [],user:user,imagePath:imagePath });
      }else{
        const masteruserID = req.user._id;
        const users = await LogInCollection.find({ masteruserID }).exec();
        const imagePath = user ? user.image : null; 
        res.render("ReadData", {users : users ,user:user, imagePath:imagePath});
      }
    } catch (error) {
      console.log(error);
      res.send('An error occurred');
    }
  });



  //---------------------//
  app.get('/updateuser/:id',checkAuthenticated,noCache, async (req, res) => {
    
    try {
      const user = await LogInCollection.findById(req.params.id).exec();
      if (user) {
        res.render('updateuser.ejs', { user });
      } else {
        req.flash('error', 'User not found');
        res.redirect('/');
      }
    } catch (error) {
      console.log(error);
      req.flash('error', 'An error occurred');
      res.redirect('/ReadData');
    }
  });

  app.post('/updateuserID',checkAuthenticated, async (req, res) => {
    const userId = req.body.userid;
    const updatedUser = {
      name: req.body.name,
      email: req.body.email,
      // role: req.body.role
    };
  
    try {
      await LogInCollection.updateOne({ _id: userId }, { $set: updatedUser });
      res.redirect('/');
    } catch (error) {
      console.log(error);
      req.flash('error', 'An error occurred while updating the user');
      res.redirect('/');
    }
  });

  app.post('/updateuser', checkAuthenticated, async (req, res) => {
    const userId = req.body.userid;
    const updatedUser = {
      // Only allow role update if the authenticated user is an admin
      // role: req.user.role === 'admin' ? req.body.role : undefined
      name: req.body.name,
      email: req.body.email,
      mobileNo: req.body.mobileNo,
      ShopName: req.body.ShopName,
      OfficeAddress: req.body.OfficeAddress,
      LockAmount: req.body.LockAmount,
      password: req.body.password, // You need to handle password hashing here
      role: req.body.role,
      ParmanentAddress: req.body.ParmanentAddress,
      ParmanentCity: req.body.ParmanentCity,
      ParmanentPincode: req.body.ParmanentPincode,
      ParmanentState: req.body.ParmanentState,
      ParmanentCountry: req.body.ParmanentCountry,
      PresentAddress: req.body.PresentAddress,
      PresentCity: req.body.PresentCity,
      PresentPincode: req.body.PresentPincode,
      PresentState: req.body.PresentState,
      PresentCountry: req.body.PresentCountry,
      RechargeServices: req.body.RechargeServices,
      MoneyServices: req.body.MoneyServices,
      AepsServices: req.body.AepsServices,
      PayoutServices: req.body.PayoutServices
      

    };
  
    try {
      // Check if the authenticated user is an admin before updating the role
      if (req.user.role === 'admin') {
        await LogInCollection.updateOne({ _id: userId }, { $set: updatedUser });
      } else {
        // If the user is not an admin, update the user's name and email only
        await LogInCollection.updateOne({ _id: userId }, { $set: { name: req.body.name, email: req.body.email } });
      }
      res.redirect('/ReadData');
    } catch (error) {
      console.log(error);
      req.flash('error', 'An error occurred while updating the user');
      res.redirect('/');
    }
  });
  
  app.get('/deleteuser/:id',checkAuthenticated, async (req, res) => {
    const userId = req.params.id;
  
    try {
      await LogInCollection.findByIdAndDelete(userId);
      res.redirect('/ReadData');
    } catch (error) {
      console.log(error);
      req.flash('error', 'An error occurred while deleting the user');
      res.redirect('/');
    }
  });
//----------newuser--------//
// Express route to fetch states based on the selected country code


app.get('/newuser',checkAuthenticated,noCache, (req, res) => {
  const user = req.user;
  const imagePath = user ? user.image : null; 

  const services = {
    RechargeServicesLink: req.user.RechargeServices,
    MoneyServicesLink: req.user.MoneyServices,
    AepsServicesLink: req.user.AepsServices,
    PayoutServicesLink: req.user.PayoutServices,
};
      res.render("newuser.ejs",{
        user:user,
        imagePath: imagePath ,
        services: services
            })
  })

app.post('/newuser',checkAuthenticated, async (req, res) => {
    const password = randomstring.generate(10)
    const newWallet = new Wallet ({
      balance: 0,
      transactions: [],
    });
    const savedWallet = await newWallet.save();
    
    const data = {
      name: req.body.name,
      email: req.body.email,
      mobileNo: req.body.mobileNo,
      ShopName: req.body.ShopName,
      OfficeAddress: req.body.OfficeAddress,
      LockAmount: req.body.LockAmount,
      password: password,
      role: req.body.role,
      ParmanentAddress: req.body.ParmanentAddress,
      ParmanentCity: req.body.ParmanentCity,
      ParmanentPincode: req.body.ParmanentPincode,
      ParmanentState: req.body.ParmanentState,
      ParmanentCountry: req.body.ParmanentCountry,
      PresentAddress: req.body.PresentAddress,
      PresentCity: req.body.PresentCity,
      PresentPincode: req.body.PresentPincode,
      PresentState: req.body.PresentState,
      PresentCountry: req.body.PresentCountry,
      RechargeServices: req.body.RechargeServices,
      MoneyServices: req.body.MoneyServices,
      AepsServices: req.body.AepsServices,
      PayoutServices: req.body.PayoutServices,
      wallet: savedWallet._id,
        
      commission:0,
      masteruserID: req.user ? req.user._id : null //  send to id.

    }
    
  
     const check =   await LogInCollection.findOne({ email: req.body.email }) 
    
    try {
        if (check) {  
                req.flash('successfully', 'User details already exist');
                res.redirect('/newuser');
        } else {
                 
            await LogInCollection.insertMany([data])
            //email send 
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
               secure: false,
               auth: {
                 user: 'vinay.singh5497@gmail.com',
                 pass: 'bcackyyamyacslqa',
               },
            //    timeout: 30000,
               
             });
               // Create a message object
            
               const message = {
                from: 'vinay.singh5497@gmail.com',
                to: req.body.email,
                subject: 'Your account has been created Successfully.',
                html: `
                  <h3>Hello,${req.body.name}</h3>
                  <p>Your account has been created with the following details:</p>
                  <p>Email:${req.body.email}</p>
                  <p>Password:${password}</p>
                  <p>ROLE:${req.body.role}</p>
                  <p>Please keep your account details secure.</p>
                `,
              };
             
               // Send the email
               transporter.sendMail(message, (error, info) => {
                 if (error) {
                   console.log('Error sending email:', error);
                 } else {
                   console.log('Email sent:', info.response);
                 }
               });
            //email send 
            req.flash('successfully', 'Email and password is Save in DataBase');
            req.flash('successfully', 'Email and password sent to User. in ORIGINAL EMAIL');
            
            res.redirect("/newuser")
        }
    } catch (error) {
        console.log(error);
    }finally {
        // Check if the data was inserted successfully
        const result = await LogInCollection.findOne({ email: req.body.email });
        if (result) {
            console.log('Data inserted successfully');
        } else {
            console.log('Data not inserted');
        }
    }

});
//------------------profile-------------------//
app.get('/profile',checkAuthenticated,noCache, (req, res) => {
    const user = req.user
        
    const imagePath = user ? user.image : null;
    res.render("profile.ejs",  { user: user, imagePath: imagePath });
  });

const storage = multer.diskStorage({
    // destination: (req, file, cb) => {
    //   cb(null, path.join(__dirname,'uploads/'));
    // },
    destination: 'public/uploads/',
    filename: (req, file, cb) => {
      // Check file extension
      const fileExtension = file.originalname.split('.').pop();
      if (fileExtension !== 'jpg' && fileExtension !== 'png') {
        return cb(new Error('Only JPG and PNG files are allowed'));
      }
      
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '.' + fileExtension);
    },
  });
  
  const upload = multer({ storage });
  
  app.use(express.static('public'));
  
  
  
  // Handle POST request for uploading an image
  app.post('/upload', upload.single('profileImage'), async (req, res) => {
    if (req.file) {
      // File was uploaded successfully
      // const imagePath = req.file.path;
      const imagePath = req.file.filename;
  
      try {
        // Find the admin by their session ID
        const user = req.user
        //await LogInCollection.findById(req.user._id);
  
        if (!user) {
          return res.status(404).send('Admin not found');
        }
  
        // Update the admin's image field with the image path
        user.image = imagePath;
        console.log(imagePath)
        await user.save();
        req.login(user, (err) => {
            if (err) {
              console.error('Error saving user to session:', err);
            }
    
            res.redirect('/');
          });
        // res.redirect('/profile');
      } catch (error) {
        console.log(error);
        res.status(500).send('An error occurred');
      }
    } else {
      // No file was uploaded
      res.status(400).send('No file selected');
    }
  });

  //----------change Password----//

  
  app.post('/change-password',checkAuthenticated, async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user;
  
    try {
      // Find the admin by their ID
      const user = await LogInCollection.findById(userId);
  
      if (!user) {
        return res.status(404).send('user not found');
      }
       // Check if the current password is a random password
       const randomPasswordMatch = currentPassword === user.password;

       if (!randomPasswordMatch) {
         // Verify the current password
         const passwordMatch = await bcrypt.compare(currentPassword, user.password);
         console.log('Password Match Result:', passwordMatch);
         if (!passwordMatch) {
           return res.status(400).send('Invalid current password');
         }
         else{
          if (newPassword !== confirmPassword) {
            return res.status(400).send('Passwords do not match');
          }
       const hashedPassword = await bcrypt.hash(newPassword, 10);
   
       // Update the admin's password
       user.password =hashedPassword;
       await user.save();
   
       res.redirect('/');
         }
       } else {
       
         if (newPassword !== confirmPassword) {
           return res.status(400).send('Passwords do not match');
         }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update the admin's password
      user.password =hashedPassword;
      await user.save();
  
      res.redirect('/profile');
      // Hash the new password
        }  
    } catch (error) {
      console.log(error);
      res.status(500).send('An error occurred');
    }
  });
//------------------profile-------------------//


//---------------super-distributot-----------------//

// Route to fetch users based on the super-distributor ID



// app.get('/SDReadData', checkAuthenticated, async (req, res) => {
//    const masteruserID = req.user._id

//   try {
//     const users = await LogInCollection.find({ masteruserID }).exec();
//     res.render('SDReadData', { users, masteruserID }); // Pass users and masteruserID to the template
//   } catch (error) {
//     console.log(error);
//     res.status(500).send('An error occurred');
//   }
// });

//-------------------------------SD --ReadData--------SD----------//

// const usersPerPage = 10; // Replace this with the desired number of users per page

// app.get('/SDReadData', checkAuthenticated,noCache, async (req, res) => {
//   const masteruserID = req.user._id;

//   try {
//     const users = await LogInCollection.find({ masteruserID }).exec();
//     const totalUsers = users.length;
//     const currentPage = req.query.page ? parseInt(req.query.page) : 1;
//     const totalPages = Math.ceil(totalUsers / usersPerPage);
//     const startIndex = (currentPage - 1) * usersPerPage;
//     const displayedUsers = users.slice(startIndex, startIndex + usersPerPage);

//     res.render('SDReadData', { users: displayedUsers, masteruserID, currentPage, totalPages, userID: req.user.name });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send('An error occurred');
//   }
// });

//--------------------SD -------------ReadData-----------SD----------//

// -------------------SD--------------new user ----------SD----------//

// app.get('/newuserID',checkAuthenticated,noCache, (req, res) => {
  
//     res.render("newuserID.ejs",{name: req.user.name,})
// })

// app.post('/newuserID',checkAuthenticated, async (req, res) => {
//   const password = randomstring.generate(10)
//   const data = {
//       name: req.body.name,
//       email: req.body.email,
//       password: password,
//       role: req.body.role,
//       // masteruserID: req.user && req.user.role === 'super-distributor' ? req.user._id : null 
//        masteruserID: req.user ? req.user._id : null
//   }
   
//    const check = null  
//   //  await LogInCollection.findOne({ email: req.body.email }) 
  
//   try {
//       if (check) {  
//               req.flash('successfully', 'User details already exist');
//               res.redirect('/newuserID');
//       } else {
//           await LogInCollection.insertMany([data])
//           console.log(data);
//           //email send 
//           const transporter = nodemailer.createTransport({
//               host: 'smtp.gmail.com',
//               port: 587,
//              secure: false,
//              auth: {
//                user: 'vinay.singh5497@gmail.com',
//                pass: 'bcackyyamyacslqa',
//              },
//           //    timeout: 30000,
             
//            });
//              // Create a message object
          
//              const message = {
//               from: 'vinay.singh5497@gmail.com',
//               to: req.body.email,
//               subject: 'Your account has been created Successfully.',
//               html: `
//                 <h3>Hello,${req.body.name}</h3>
//                 <p>Your account has been created with the following details:</p>
//                 <p>Email:${req.body.email}</p>
//                 <p>Password:${password}</p>
//                 <p>ROLE:${req.body.role}</p>
//                 <p>Please keep your account details secure.</p>
//               `,
//             };
           
//              // Send the email
//              transporter.sendMail(message, (error, info) => {
//                if (error) {
//                  console.log('Error sending email:', error);
//                } else {
//                  console.log('Email sent:', info.response);
//                }
//              });
//           //email send 
//           req.flash('successfully', 'Email and password is Save in DataBase');
//           req.flash('successfully', 'Email and password sent to User. in ORIGINAL EMAIL');
          
//           res.redirect("/newuserID")
//       }
//   } catch (error) {
//       console.log(error);
//   }finally {
//       // Check if the data was inserted successfully
//       const result = await LogInCollection.findOne({ email: req.body.email });
//       if (result) {
//           console.log('Data inserted successfully');
//       } else {
//           console.log('Data not inserted');
//       }
//   }

// });

//--------------------SD -------------ReadData-----------SD----------//

//--------------------SD ------------------------SD----------//

// app.post('/updateusermaster',checkAuthenticated, async (req, res) => {
//   const userId = req.body.userid;
//   const updatedUser = {
//     name: req.body.name,
//     email: req.body.email,
//     // role: req.body.role
//   };

//   try {
//     await LogInCollection.updateOne({ _id: userId }, { $set: updatedUser });
//     res.redirect('/SDReadData');
//   } catch (error) {
//     console.log(error);
//     req.flash('error', 'An error occurred while updating the user');
//     res.redirect('/profile');
//   }
// });

// ------------SD ----update and delete ---------------//

// app.get('/SDupdateuser/:id',checkAuthenticated,noCache, async (req, res) => {
    
//   try {
//     const user = await LogInCollection.findById(req.params.id).exec();
//     if (user) {
//       res.render('SDupdateuser.ejs', { user });
//     } else {
//       req.flash('error', 'User not found');
//       res.redirect('/SDReadData');
//     }
//   } catch (error) {
//     console.log(error);
//     req.flash('error', 'An error occurred');
//     res.redirect('/SDReadData');
//   }
// });

// app.post('/SDupdateuserID',checkAuthenticated, async (req, res) => {
//   const userId = req.body.userid;
//   const updatedUser = {
//     name: req.body.name,
//     email: req.body.email,
//     // role: req.body.role
//   };

//   try {
//     await LogInCollection.updateOne({ _id: userId }, { $set: updatedUser });
//     res.redirect('/SDReadData');
//   } catch (error) {
//     console.log(error);
//     req.flash('error', 'An error occurred while updating the user');
//     res.redirect('/profile');
//   }
// });

// app.get('/deleteuserID/:id',checkAuthenticated, async (req, res) => {
//   const userId = req.params.id;

//   try {
//     await LogInCollection.findByIdAndDelete(userId);
//     res.redirect('/SDReadData');
//   } catch (error) {
//     console.log(error);
//     req.flash('error', 'An error occurred while deleting the user');
//     res.redirect('/');
//   }
// });

// ------------SD ----update and delete ---------------//

//---------------super-distributot-----------------//

// ----DD--------Distributor -------------DD-------//
// app.get('/DDnewuser',checkAuthenticated,noCache, (req, res) => {
  
//   res.render("DDnewuser.ejs",{name: req.user.name,})
// })

// ---------------country state city----------------------------//


app.get('/api/countries', (req, res) => {
  // Fetch all countries using the country-state-city package
  const countries = Country.getAllCountries();

  // Send the list of countries as a JSON response
  res.json(countries);
});

app.get('/states/:countryCode', async (req, res) => {
  const countryCode = req.params.countryCode;
 // console.log('Fetching states for countryCode:', countryCode);

  try {
    // Fetch states for the given countryCode using the country-state-city package
    const states = await State.getStatesOfCountry(countryCode);
   // console.log('States:', states);
    res.json(states);
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/cities/:countryCode/:stateCode', async (req, res) => {
  const countryCode = req.params.countryCode;
  const stateCode = req.params.stateCode;
  //console.log('Fetching cities for stateCode:', stateCode, 'and countryCode:', countryCode);

  try {
    // Fetch cities for the given stateCode using the country-state-city package
    
    const citie= await City.getCitiesOfCountry(countryCode);
    const cities = await citie.filter(city => city.stateCode === stateCode);
    //console.log('Cities:', cities);
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------country state city----------------------------//

//-------------------wallet ----------------------------------//

    
// Server-side route to render the Transaction.ejs template
app.get('/Transaction', checkAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    const imagePath = user ? user.image : null; 

    const page = parseInt(req.query.page) || 1;
    const perPage = 10;

    if (!user) {
      return res.status(500).send('User not found.');
    }
    if (!user.wallet) {
      return res.status(500).send('User does not have a wallet reference.');
    }
    const wallet = await Wallet.findById(user.wallet).populate('transactions');
    if (!wallet) {
      return res.status(500).send('Wallet not found.');
    }
    
    const transactions = wallet.transactions || [];
    
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedTransactions = transactions.slice(startIndex, endIndex);
    const totalPages = Math.ceil(transactions.length / perPage);

    res.render('Transaction.ejs', { 
      imagePath: imagePath,
      user:user,
      transactions: paginatedTransactions,
      currentPage: page,
      totalPages: totalPages
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'An error occurred while fetching transactions', error: error.message });
  }
});




app.get('/add-amount/:id', async (req, res) => {
  const userId = req.params.id;

  
  try {
    const data = await LogInCollection.findById(userId).exec();
    if (data) {
      
      res.render("add-amount.ejs", { data:data });
    } else {
      req.flash('error', 'User not found');
      res.redirect('/');
    }
  } catch (error) {
    console.error('Error:', error);
    req.flash('error', 'An error occurred.');
    res.redirect('/');
  }
});


// Route to handle the admin adding amount to their wallet
// Endpoint to add amount to admin's wallet
app.post('/add-amount-admin', checkAuthenticated, async (req, res) => {
  const { amount } = req.body;

  try {
    const user = req.user;
   // const user = await LogInCollection.findById(req.user._id).populate('wallet');

    if (user.role !== 'admin') {
      return res.status(500).send('Admin not found.');
    }

    if (!user.wallet) {
      // Create a new wallet if it doesn't exist
      const newWallet = new Wallet({
        balance: 0,
        transactions: [],
      });
      const savedWallet = await newWallet.save();
      user.wallet = savedWallet._id;
      }
        else {
         if (user.wallet) {
        const wallet = await Wallet.findById(user.wallet);
        if (wallet) {
          
          wallet.balance += parseInt(amount);
         // await wallet.save();
         const newTransaction = new Transaction({
          type: 'credit',
          amount: parseInt(amount),
          date: new Date(),
          user: user._id,
         });
         const savedTransaction = await newTransaction.save();
         wallet.transactions.push(savedTransaction._id);
         await wallet.save();

        } else {
          console.error('Wallet not found');
        }
      } else {
        console.error('User does not have a wallet reference');
      }
    }
    await user.save();
    res.redirect('/');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred.');
  }
});



// Endpoint to transfer amount to another user
app.post("/transfer-amount", async (req, res) => {
  const { userId, amount } = req.body;

  try {
    const user0 = await LogInCollection.findById(userId);

    if (!user0) {
      return res.status(404).json({ message: "User not found." });
    }

    // Deduct the amount from admin's wallet (req.user is the admin)
    if (req.user.wallet) {
      const adminWallet = await Wallet.findById(req.user.wallet);

      if (!adminWallet) {
        return res.status(500).json({ message: "Admin wallet not found." });
      }

      adminWallet.balance -= amount;
      const debitTransaction = new Transaction({
        type: "debit",
        amount: parseInt(amount),
        date: new Date(),
        user: req.user._id,
      });

      await debitTransaction.save();
      adminWallet.transactions.push(debitTransaction._id);
      await adminWallet.save();
    } else {
      return res.status(500).json({ message: "Admin wallet not found." });
    }

    // Add the amount to the user's wallet
    if (!user0.wallet) {
      const newWallet = new Wallet({
        balance: 0,
        transactions: [],
      });
      const savedWallet = await newWallet.save();
      user0.wallet = savedWallet._id;
      await user0.save();
    }

    const user0Wallet = await Wallet.findById(user0.wallet);

    if (!user0Wallet) {
      return res.status(500).json({ message: "User wallet not found." });
    }

    user0Wallet.balance += amount;
    const creditTransaction = new Transaction({
      type: "credit",
      amount: parseInt(amount),
      date: new Date(),
      user: user0._id,
    });

    await creditTransaction.save();
    user0Wallet.transactions.push(creditTransaction._id);
    await user0Wallet.save();

    res.status(200).json({ message: "Amount transferred successfully." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "An error occurred." });
  }
});



// void funcrio(id, amount)


// -------------------commission of everyone--------------//
app.get('/getProvider', async (req, res) => {
  try {
    const providerResponse = await fetch('https://btrackworld.in/api/telecom/v1/get-provider', {
      method: 'GET', 
      headers: {
        'Authorization': 'Bearer 5Oqw1NJTjuAxJ7bQ3yPoBRhjoXnEHMje5zLRvIlJqFhWEfE5oDB3B3SIwNR5'
      }
    });

    const providerData = await providerResponse.json();
    // console.log(providerData,"real api");
    
    res.json(providerData);
  } catch (error) {
    console.error('Error fetching provider data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


 app.post("/processTransaction", async (req, res) => {
   const { serviceType, amount, retailerId,provider_id,number,client_id  } = req.body;
   console.log("Received data:", req.body);
//const processTransaction = async (serviceType, amount, retailerId) => {
  try {
    // Find the retailer document
    const retailer = await LogInCollection.findById(retailerId).populate({
      path: 'masteruserID',
      populate: {
        path: 'masteruserID',
        populate: {
          path: 'masteruserID'
        }
      }
    });

    if (!retailer) {
      throw new Error('Retailer not found');
    }

    const distributorId = retailer.masteruserID._id;
    const superDistributorId = retailer.masteruserID.masteruserID._id;
    const adminId = retailer.masteruserID.masteruserID.masteruserID._id;

    // Calculate commissions
    const commissions = {
      'RechargeServices': {'admin': 2, 'super_distributor': 1.5, 'distributor': 1, 'retailer': 0.5},
      'MoneyServices': {'admin': 1, 'super_distributor': 0.8, 'distributor': 0.6, 'retailer': 0.4},
      'AepsServices': {'admin': 1.5, 'super_distributor': 1.2, 'distributor': 0.9, 'retailer': 0.6},
      'PayoutServices': {'admin': 1.5, 'super_distributor': 1.2, 'distributor': 0.9, 'retailer': 0.6},
    };

    const commission = commissions[serviceType];
    const retailerCommission = amount * (commission['retailer'] / 100);
    const distributorCommission = amount * (commission['distributor'] / 100);
    const superDistributorCommission = amount * (commission['super_distributor'] / 100);
    const adminCommission = amount * (commission['admin'] / 100);

    // Update retailer's wallet balance
    const retailerWallet = await Wallet.findById(retailer.wallet);
    const retailerDebitTransaction = new Transaction({
      type: 'debit',
      amount: amount,
      date: new Date(),
      user: retailer._id,
    });
    await retailerDebitTransaction.save();
   // retailerWallet.balance -= retailerCommission;
    retailerWallet.balance -= amount;
    retailerWallet.transactions.push(retailerDebitTransaction._id);

    await retailerWallet.save();
    // Update commission for admin, super-distributor, and distributor
    const admin = await LogInCollection.findById(adminId);
    if (admin) {
      admin.commission += adminCommission;
      await admin.save();

      const adminWallet = await Wallet.findById(admin.wallet)
      const adminCreditTransaction = new Transaction({
        type: 'credit-Commission',
        amount: adminCommission,
        date: new Date(),
        user: admin._id,
      });
      await adminCreditTransaction.save();
      adminWallet.balance += adminCommission;
      adminWallet.transactions.push(adminCreditTransaction._id);
       await adminWallet.save();
    }

    const superDistributor = await LogInCollection.findById(superDistributorId);
    if (superDistributor) {
      superDistributor.commission += superDistributorCommission;
      const superDistributorCreditTransaction = new Transaction({
        type: 'credit-Commission',
        amount: superDistributorCommission,
        date: new Date(),
        user: superDistributor._id,
      });
      await superDistributorCreditTransaction.save();
      await superDistributor.save();
      // Update wallet balances for super distributor
      const superDistributorWallet = await Wallet.findById(superDistributor.wallet)
      superDistributorWallet.balance += superDistributorCommission;
      superDistributorWallet.transactions.push(superDistributorCreditTransaction._id);
      await superDistributorWallet.save();
    }

    const distributor = await LogInCollection.findById(distributorId);
    if (distributor) {
      distributor.commission += distributorCommission;
      const distributorCreditTransaction = new Transaction({
        type: 'credit-Commission',
        amount: distributorCommission,
        date: new Date(),
        user: distributor._id,
      });
      await distributorCreditTransaction.save();
      await distributor.save();

       // Update wallet balances for distributor
      const distributorWallet = await Wallet.findById(distributor.wallet)
      distributorWallet.balance += distributorCommission;
      distributorWallet.transactions.push(distributorCreditTransaction._id);
      await distributorWallet.save();
    }
    //const retailer = await LogInCollection.findById(retailerId);
    if (retailer) {
      retailer.commission += retailerCommission;
      const retailerCreditTransaction = new Transaction({
        type: 'credit-Commission',
        amount: retailerCommission,
        date: new Date(),
        user: retailer._id,
      });
      await retailerCreditTransaction.save();
      await retailer.save();

       // Update wallet balances for distributor
      const retailerWallet = await Wallet.findById(retailer.wallet)
      retailerWallet.balance += retailerCommission;
      retailerWallet.transactions.push(retailerCreditTransaction._id);
      await retailerWallet.save();
    }

    //-------------payment-----------//
    const queryString = new URLSearchParams({
      number: number,
      provider_id: provider_id,
      amount: amount,
      client_id: client_id
    }).toString();

    const paymentResponse = await fetch(`https://btrackworld.in/api/telecom/v1/payment?${queryString}`, {
      method: 'GET', 
      headers: {
        "Authorization": "Bearer 5Oqw1NJTjuAxJ7bQ3yPoBRhjoXnEHMje5zLRvIlJqFhWEfE5oDB3B3SIwNR5", 
        "Content-Type": "application/json",
      },
     
    });
    console.log("Payment API request headers:", paymentResponse.headers);
    const paymentData = await paymentResponse.json();
    console.log("Payment API response:", paymentData);
    //-------------payment-----------//

    res.status(200).json({ 
      message: 'Transaction processed successfully'
     
    });
  } catch (error) {
    console.error('Error processing transaction:', error.message);
    res.status(500).json({ message: 'An error occurred while processing the transaction' });
  }
  //
  
});




// -------------------commission of everyone--------------//
app.get('/checkbalance', async (req, res) => {
  try {
    const checkResponse = await fetch('https://btrackworld.in/api/telecom/v1/check-balance', {
      method: 'GET', 
      headers: {
        'Authorization': 'Bearer 5Oqw1NJTjuAxJ7bQ3yPoBRhjoXnEHMje5zLRvIlJqFhWEfE5oDB3B3SIwNR5'
      }
    });

    const checkData = await checkResponse.json(); 
    res.json(checkData);
  } catch (error) {
    console.error('Error fetching provider data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// -------------------commission of everyone--------------//






// app.listen(5000)

app.listen(5000, () => {
    console.log('Listen to 5000')})