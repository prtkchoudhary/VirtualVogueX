const User = require("./user");
const Admin = require("./admin"); // Import the Admin model
const bcrypt = require("bcryptjs");
const localStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require('dotenv').config(); // Load environment variables

module.exports = function (passport) {
  passport.use(
    new localStrategy(async (username, password, done) => {
      try {
        // First, look for the user in the User collection
        let user = await User.findOne({ username });
        if (!user) {
          // If not found in User, look for the user in Admin
          user = await Admin.findOne({ username });
        }

        if (!user) return done(null, false, { message: "User not found" });

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Incorrect password" });
        }
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID, // Load from .env
        clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Load from .env
        callbackURL: process.env.GOOGLE_CALLBACK_URL, // Load from .env
      },
      async function (accessToken, refreshToken, profile, cb) {
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            return cb(null, user);
          } else {
            const newUser = new User({
              googleId: profile.id,
              username: profile.displayName,
            });
            await newUser.save();
            return cb(null, newUser);
          }
        } catch (err) {
          return cb(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, cb) => {
    cb(null, { id: user.id, isAdmin: user instanceof Admin });
  });

  passport.deserializeUser(async (obj, cb) => {
    try {
      const Model = obj.isAdmin ? Admin : User;
      const user = await Model.findById(obj.id);

      if (user) {
        const userInformation = {
          _id: user._id,
          username: user.username,
          isAdmin: obj.isAdmin,
          mobile: user.mobile,
          address: user.address,
          orders: user.orders,
          cart: user.cart,
          wishlist: user.wishlist,
          email: user.email,
        };
        cb(null, userInformation);
      } else {
        cb(null, null);
      }
    } catch (err) {
      cb(err, null);
    }
  });
};
