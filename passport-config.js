// const LocalStrategy = require("passport-local").Strategy
// const bcrypt = require("bcrypt")


// function initialize(passport, getUserByEmail, getUserById){
//     // Function to authenticate users
//     const authenticateUsers = async (email, password, done) => {
//         // Get users by email
//         const user = getUserByEmail(email)
//         if (user == null){
//             return done(null, false, {message: "No user found with that email"})
//         }
//         try {
//             if(await bcrypt.compare(password, user.password)){
//                 return done(null, user)
//             } else{
//                 return done (null, false, {message: "Password Incorrect"})
//             }
//         } catch (e) {
//             console.log(e);
//             return done(e)
//         }
//     }

//     passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUsers))
//     passport.serializeUser((user, done) => done(null, user.id))
//     passport.deserializeUser((id, done) => {
//         return done(null, getUserById(id))
//     })
// }

// module.exports = initialize

///-----------////-------////-----------///----///
///////-------------///////////////

const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
        const{ LogInCollection} = require("./mongodb");
// const LogInCollection = require('./models/LogInCollection'); // Replace this with the correct path to your model file

// Function to get a user by name
const getUserByName = async (name) => {
  try {
    const user = await LogInCollection.findOne({ name });
    return user;
  } catch (error) {
    console.error('Error fetching user by name:', error);
    return null;
  }
};

// Function to get a user by email
const getUserByEmail = async (email) => {
  try {
    const user = await LogInCollection.findOne({ email });
    return user;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
};

function initialize(passport, getUserById) {
  // Function to authenticate users
  const authenticateUsers = async (identifier, password, done) => {
    // Get user by email
    const userByEmail = await getUserByEmail(identifier);

    // Get user by name
    const userByName = await getUserByName(identifier);

    if (!userByEmail && !userByName) {
      return done(null, false, { message: "No user found with that email or name" });
    }

    const user = userByEmail || userByName;

    try {
      // Check if password matches using bcrypt
      const passwordMatch = await bcrypt.compare(password, user.password);
      const randomPasswordMatch =  await (password === user.password);

      if (!(passwordMatch || randomPasswordMatch))  {
        // Wrong password
        return done(null, false, { message: "Password Incorrect" });
      }
      else{
        console.log(user)
        
        return done (null,user,{message:"Successfully login"});
        
      }

     
    } catch (e) {
      console.log(e);
      return done(e);
    }
  };

  passport.use(new LocalStrategy({ usernameField: "identifier" }, authenticateUsers));
  passport.serializeUser((user, done) => done(null, user.id));
  // passport.deserializeUser((id, done) => {
  //   return done(null, getUserById(id));
  // });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await LogInCollection.findById(id).exec();
      done(null, user);
    } catch (error) {
      console.error('Error fetching user by id:', error);
      done(error);
    }
  });
}

module.exports = initialize;