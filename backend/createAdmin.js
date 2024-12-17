const mongoose = require('mongoose');
const Admin = require('./admin'); // Adjust the path to your admin model

mongoose.connect('mongodb+srv://prtkfinal:prtk77@cluster0.ty5mf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

async function createAdmin() {
  const username = 'admin';
  const password = 'admin';
  const adminCode = 'admin1'; // Replace with the actual admin code

  try {
    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      console.log("Admin user already exists.");
    } else {
      // If not, create a new admin
      const admin = new Admin({ username, password, adminCode });
      await admin.save();
      console.log("Admin user created");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
