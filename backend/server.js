// This is the entry point for the backend (aka the index.js file).
// All backend dependencies are connected here. Mongoose has to be connected and RESTful routes defined.

//mongodb+srv://soham:thisisthepassword@test-cluster.qybal.mongodb.net/test-cluster?retryWrites=true&w=majority

//========================================= IMPORTS
require("dotenv").config(); 
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const expressSession = require("express-session");
const bodyParser = require("body-parser");
const nodemailer = require('nodemailer');


const app = express();
const PORT = 5000;

const Admin = require("./admin"); // Admin model
const User = require("./user");
const Product = require("./product");
//========================================= MONGODB CONNECT

mongoose.connect(
  process.env.MONGODB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
  }
)
.then(() => console.log("Users Database (MongoDB) is now connected"))
.catch((err) => console.error("MongoDB connection error:", err));

//========================================= MIDDLEWARE

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: '*', // location of react frontend
    credentials: true,
  })
);
app.use(
  expressSession({
    secret: "mondal",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(cookieParser("mondal"));
app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);
app.get("/api/get-artoken", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ apiToken: process.env.REACT_APP_AR_API_TOKEN });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});



// Use CORS to allow frontend access
app.use(cors({ origin: '*' })); // adjust for frontend URL

// Route to send the API token
app.get("/api/token", (req, res) => {
  // Ensure the user is authenticated if necessary
  res.json({ apiToken: process.env.AR_API_TOKEN });
});

// Start server (example)

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'exchangesupercell@gmail.com',
    pass: 'opucxcrtehyyozsm'
  }
});

const mailOptions = {
  from: 'exchangesupercell@gmail.com',
  to: 'satijadev8@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'You added something to cart. That was easy!'
};


//========================================= ROUTES

app.get('/google',
  passport.authenticate('google', { scope: ['profile','email'] }));

app.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('http://localhost:3000/profile');
  });

  app.post("/login", async (req, res, next) => {
    const { username, password, adminCode } = req.body;
  
    try {
      if (adminCode) {
        const admin = await Admin.findOne({ username });
        if (!admin) return res.status(400).send("Admin not found");
  
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) return res.status(400).send("Invalid credentials");
  
        req.logIn(admin, (err) => {
          if (err) return res.status(500).send("Login error");
          return res.send({ message: "Admin logged in", isAdmin: true });
        });
      } else {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).send("User not found");
  
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send("Invalid credentials");
  
        req.logIn(user, (err) => {
          if (err) return res.status(500).send("Login error");
          return res.send({ message: "User logged in", isAdmin: false });
        });
      }
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).send("Server error");
    }
  });
  

  const checkAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
      return next();
    }
    res.status(403).json({ message: "Access denied" });
  };

  app.put("/updateproduct/:id", checkAdmin, async (req, res) => {
    const productId = req.params.id;
    const updatedData = req.body;
  
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { $set: updatedData },
        { new: true, runValidators: true }
      );
      if (updatedProduct) {
        res.status(200).json({ message: "Product updated successfully", updatedProduct });
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Error updating product", error });
    }
  });

  app.delete("/deleteproduct/:id", checkAdmin, (req, res) => {
    const productId = req.params.id;
  
    Product.findByIdAndDelete(productId, (err) => {
      if (err) {
        console.error("Error deleting product:", err);
        return res.status(500).send("Failed to delete product.");
      }
      res.send("Product successfully deleted.");
    });
  });

  app.get("/check-admin", (req, res) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
      res.json({ isAdmin: true });
    } else {
      res.json({ isAdmin: false });
    }
  });

  app.get('/logout', function(req, res) {
    req.logout(function(err) {
      if (err) { 
        console.error("Error logging out:", err);
        return res.status(500).send("Error logging out");
      }
      res.redirect('/');
    });
  });

  
app.post("/register", (req, res) => {
  User.findOne({ username: req.body.username }, async (err, doc) => {
    if (err) throw err;
    if (doc) res.send("User already exists, please login");
    if (!doc) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const newUser = new User({
        username: req.body.username,
        mobile: req.body.mobile,
        email: req.body.email,
        password: hashedPassword,
      });
      await newUser.save();
      res.send("Welcome to FSHN!");

      const welcomeEmail = {
        from: 'exchangesupercell@gmail.com',
        to: req.body.email,
        subject: 'Welcome to FSHN! ✨',
        html: `
        <body style="font-family: Arial, Helvetica, sans-serif">
        <center>
        <img src="https://res.cloudinary.com/dl6m7txan/image/upload/v1602013956/3_rlqeb0.png" style="width: 100%;" >
        <h1 style="background-color: black; color: #edca0d;">Welcome to FSHN!</h1>
        <br>
        <b>Hello, ${req.body.username}!</b> We're so excited to have you on board! <br><br>
        <span style="color: #edca0d; font-weight: 600"> FSHN </span> (pronounced <i>fashion</i>) stands for <b>"Fashionable, Sustainable, Haute & Nouveau."</b>
        We strive to make quality design available to everyone in an affordable and sustainable way.<br><br>     
        Based in New York, FSHN is an international fashion brand, offering the latest styles and inspiration for all — always.
        Customers will find everything from fashion pieces and unique designer collaborations to affordable wardrobe essentials, complete-the-look accessories, and motivational workout wear.
        All seasons, all styles, all welcome! But FSHN is more than
         just apparel.
        With price, quality and sustainability deeply rooted in its DNA, FSHN is not only a possibility for everyone to explore their personal style, but it also offers a chance to create a more sustainable fashion future.<br><br>
        <b>Be sure to look out for:</b><br>
        ⭐ Our monthly free giveaways! If you made a purchase with us of over $50 (USD) you directly qualify for that month's giveaway where we gift select random customers some of the hottest outfits of the season!<br>
        ⭐ Our half-yearly sales that take place every summer and winter. Get the best clothes at the best prices!<br>
        ⭐ Our exciting emails that glam up your inbox and might help inspire your next look.<br>
        <br><br>
        <img src="https://res.cloudinary.com/dfymeww45/image/upload/v1603122141/welcome.jpg" style="width: 100%">
        <h1><b>Experience <span style="color: #edca0d;">FSHN.</span></b></h1>
      </body>`
      };
    
      transporter.sendMail(welcomeEmail, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    }
  });
});

// =================== Add new product to DB ROUTE:

app.post("/addproduct", (req, res) => {
  
      const newProduct = new Product({
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        color:req.body.color,
        gender:req.body.gender,
        imageurl: req.body.imageurl,
        price: req.body.price,
        rating: req.body.rating,
        lensId: req.body.lensId,
        lensGroupId: req.body.lensGroupId
      });
      newProduct.save();
      res.send("New product added");
    
});

app.post("/changeprice", (req, res) => {
  
  Product.findOne({_id: req.body.productId}, async(err, doc) => {
    if (err) throw err;
    if (!doc) res.send("User does not exist!");
    if (doc) {

      let wishers = doc.wishers;
      for(var i = 0; i < wishers.length; i++){
        User.findOne({_id:wishers[i]}, (err,user) => {
          if (err) throw err;
          if(user){

              const changeEmail = {
              from: 'exchangesupercell@gmail.com',
              to: user.email,
              subject: 'FSHN: Some item(s) in your wishlist have changed prices',
              text: 'An item in your wishlist has recently changed price.'
            };
          
            transporter.sendMail(changeEmail, function(error, info){
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });

          }
        })
      }

      doc.price = req.body.newprice
      await doc.save();
      res.send("Product updated");
    }
  })
  

});

// =================== Update User Details ROUTES:

app.post("/update/number", (req, res) => {
  User.findOne({ username: req.user.username }, async (err, doc) => {
    if (err) throw err;
    if (!doc) res.send("User does not exist!");
    if (doc) {
      doc.mobile = req.body.mobile;
      await doc.save();
      res.send("User mobile updated.");
    }
  });
});

app.post("/update/address", (req, res) => {
  User.findOne({ username: req.user.username }, async (err, doc) => {
    if (err) throw err;
    if (!doc) res.send("User does not exist!");
    if (doc) {
      doc.address = req.body.address;
      await doc.save();
      res.send("User address updated.");
    }
  });
});

// =================== Main shopping (Cart/ Wishlist/ Buy) ROUTES:

app.post("/addtocart", (req, res) => {
  //transporter.sendMail(mailOptions, function(error, info){
  //  if (error) {
  //    console.log(error);
  //  } else {
  //    console.log('Email sent: ' + info.response);
  //  }
  //});

  if (!req.user){
    res.send("Please login first!")
  }
  else{

    Product.findOne({_id: req.body.productId}, async (err,doc) => {
      if (err) throw err;
      if (doc){
          if (doc.wishers.includes(req.user._id)){
            await res.send("Product already exists in your wishlist!");
          }
          else if(doc.buyers.includes(req.user._id)){
            res.send("Product already purchased once!");
          }
          else if(req.user.cart.includes(req.body.productId)){
            res.send("Product already exists in your cart!");
          }
          else{
            User.findOne({ username: req.user.username }, async (err, doc) => {
              if (err) throw err;
              if (!doc) res.send("User does not exist!");
              if (doc) {
                doc.cart.push(req.body.productId);
                await doc.save();
                res.send("Product successfully added to cart!");
              }
            });
          }
        }

    })
    
  }
  
});

app.post("/movetocart", async (req, res) => {
  try {
    // Find and update user
    const user = await User.findOne({ username: req.user.username });
    if (!user) return res.send("User does not exist!");

    user.cart.push(req.body.productId);
    user.wishlist.pull(req.body.productId);
    await user.save();

    // Find and update product
    const product = await Product.findOne({ _id: req.body.productId });
    if (!product) return res.send("Product does not exist!");

    product.wishers.pull(req.user._id);
    await product.save();

    return res.send("Product moved from wishlist to cart.");
  } catch (error) {
    console.error("Error moving product to cart:", error);
    return res.status(500).send("An error occurred");
  }
});

// Remove item from cart
app.post("/removefromcart", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) return res.send("User does not exist!");

    user.cart.pull(req.body.productId);
    await user.save();

    return res.send("Product removed from cart.");
  } catch (error) {
    console.error("Error removing product from cart:", error);
    return res.status(500).send("An error occurred");
  }
});

// Get items in cart
app.get("/getcartitems", async (req, res) => {
  if (!req.user) {
    console.log("Please log in to proceed!");
    return res.send("Please log in to proceed!");
  }

  try {
    const cartItems = await Product.find({ _id: { $in: req.user.cart } });
    return res.send(cartItems);
  } catch (error) {
    console.error("Error retrieving cart items:", error);
    return res.status(500).send("An error occurred while retrieving cart items.");
  }
});

app.post("/addtowishlist", async (req, res) => {
  if (!req.user) {
    return res.send("Please login first");
  }

  try {
    const product = await Product.findOne({ _id: req.body.productId });
    if (!product) {
      return res.send("Product does not exist!");
    }

    if (product.wishers.includes(req.user._id)) {
      return res.send("Product already exists in your wishlist!");
    }

    if (product.buyers.includes(req.user._id)) {
      return res.send("Product already purchased once!");
    }

    // Add product to user's wishlist
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.send("User does not exist!");
    }

    user.wishlist.push(req.body.productId);
    await user.save();

    // Update product wishers
    product.wishers.push(req.user._id);
    await product.save();

    return res.send("Product added to wishlist and wishlist-er updated!");
  } catch (error) {
    console.error("Error adding product to wishlist:", error);
    return res.status(500).send("An error occurred");
  }
});

// Move to Wishlist Route
app.post("/movetowishlist", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.send("User does not exist!");
    }

    user.wishlist.push(req.body.productId);
    user.cart.pull(req.body.productId);
    await user.save();

    const product = await Product.findOne({ _id: req.body.productId });
    if (!product) {
      return res.send("Product does not exist!");
    }

    product.wishers.push(req.user._id);
    await product.save();

    return res.send("Product moved to wishlist and wishlist-er added!");
  } catch (error) {
    console.error("Error moving product to wishlist:", error);
    return res.status(500).send("An error occurred");
  }
});

// Remove from Wishlist Route
app.post("/removefromwishlist", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.send("User does not exist!");
    }

    user.wishlist.pull(req.body.productId);
    await user.save();

    const product = await Product.findOne({ _id: req.body.productId });
    if (!product) {
      return res.send("Product does not exist!");
    }

    product.wishers.pull(req.user._id);
    await product.save();

    return res.send("Product removed from wishlist.");
  } catch (error) {
    console.error("Error removing product from wishlist:", error);
    return res.status(500).send("An error occurred while removing the product.");
  }
});

// Get Wishlist Items Route
app.get("/getwishlistitems", async (req, res) => {
  if (!req.user) {
    return res.send("Please log in to proceed!");
  }

  try {
    const products = await Product.find({ _id: { $in: req.user.wishlist } });
    return res.send(products);
  } catch (error) {
    console.error("Error fetching wishlist items:", error);
    return res.status(500).send("An error occurred while retrieving wishlist items.");
  }
});

app.post("/buyproduct", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) return res.send("User does not exist!");

    const product = await Product.findOne({ _id: req.body.productId });
    if (!product) return res.send("Product does not exist!");

    user.orders.push(req.body.productId);
    user.cart.pull(req.body.productId);
    await user.save();

    product.buyers.push(req.user._id);
    await product.save();

    res.send("New order made and buyer added!");
  } catch (err) {
    res.status(500).send("An error occurred");
  }
});

app.post("/buyallproducts", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) return res.send("User does not exist!");

    const products = req.user.cart;
    const productIds = [];
    for (const productId of products) {
      user.orders.push(productId);
      user.cart.pull(productId);
      productIds.push(productId);
    }

    await user.save();

    // Update all products in parallel using Promise.all
    await Promise.all(
      productIds.map(async (productId) => {
        const product = await Product.findOne({ _id: productId });
        if (product) {
          product.buyers.push(req.user._id);
          await product.save();
        }
      })
    );

    res.send("New orders made for all products and buyers added!");
  } catch (err) {
    res.status(500).send("An error occurred");
  }
});


app.get("/getorderitems", (req, res) => {
  if (!req.user) res.send([]);
  if (req.user){
    Product.find({_id : {$in: req.user.orders}}, async (err, doc) =>{
      if (err) throw err;
      if (doc){
        await res.send(doc);
        console.log(doc)
      }
    });
  }
});

app.post("/addreview", (req, res) => {

  if(!req.user){
    res.send("Please login first!");
  }
  else{
    Product.findOne({ _id: req.body.productId}, async (err, doc) => {
      if (err) throw err;
      if (!doc) res.send("Product does not exist!");
      if (!req.user) res.send("Login to continue");
      if (doc && req.user) {
        if (req.user.orders.includes(req.body.productId)){
          var newreview = {body: req.body.review, user: req.user.username, verified: "Y"};
          doc.reviews.push(newreview);
          await doc.save();
          console.log(newreview)
          res.send("New verified review added!");
        }
        else{
          var newreview = {body: req.body.review, user: req.user.username, verified: "N"};
          doc.reviews.push(newreview);
          await doc.save();
          console.log(newreview)
          res.send("New review added!");
        }
        
      }
    })
  }

  
});

// =================== Some more product ROUTES

app.get("/getproducts", (req, res) => {
  Product.find({}, async (err, doc) =>{
    if (err) throw err;
    if (doc){
      await res.send(doc);
    }
  });
});
app.get("/getfeaturedproducts", (req, res) => {
  Product.find({featured : "YES"}, async (err, doc) =>{
    if (err) throw err;
    if (doc){
      await res.send(doc);
    }
  });
});
app.get("/productsearch/:term", (req, res) => {
  const searchterm = req.params.term;
  if (searchterm === ""){
    Product.find({}, async (err, doc) =>{
      if (err) throw err;
      if (doc){
        await res.send(doc);
        //console.log(doc);
      }
    });
  }
  else{
    Product.find({$or: [{name : {$regex: searchterm, $options: 'i'}}, {category : {$regex: searchterm, $options: 'i'}}] }, async (err, doc) =>{
      if (err) throw err;
      if (doc){
        await res.send(doc);
        //console.log(doc);
      }
    });
  }
  
});
app.get("/productsearchbygender/:gender", (req, res) => {
  const gender = req.params.gender;

  if (gender==="A"){
    Product.find({}, async (err, doc) =>{
      if (err) throw err;
      if (doc){
        await res.send(doc);
        //console.log(doc);
      }
    });

  }
  else{
    Product.find({gender: gender}, async (err, doc) =>{
      if (err) throw err;
      if (doc){
        await res.send(doc);
        //console.log(doc);
      }
    });
  }
  
});

app.get("/productsearchbycolor/:color", (req, res) => {
  const color = req.params.color;

  
  if (color==="A"){
    Product.find({}, async (err, doc) =>{
      if (err) throw err;
      if (doc){
        await res.send(doc);
        //console.log(doc);
      }
    });

  }
  else{
    Product.find({color: color}, async (err, doc) =>{
      if (err) throw err;
      if (doc){
        await res.send(doc);
        //console.log(doc);
      }
    });
  }
  
});
app.get("/getproductbyid/:id", (req, res) => {
  const productId = req.params.id;
  Product.find({_id : productId}, async (err, doc) =>{
    if (err) throw err;
    if (doc){
      await res.send(doc);
    }
  });
});

app.get("/user", (req, res) => {
  if(!req.user){
    res.send("Please login first")
  }
  if(req.user){
    res.send(req.user);
  }
  
  //console.log(req.user); // req.user stores the deserealized user that has been authenticated inside it
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});
// Serve frontend static files from the 'frontend/build' directory if deployed
if (process.env.NODE_ENV === "production") {
  app.use(express.static("frontend/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
}
//========================================= SERVER STARTING

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
