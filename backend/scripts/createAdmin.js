require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user");

async function createAdmin() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/auth_system", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Admin already exists:");
      console.log(`Username: ${existingAdmin.username}`);
      console.log(`Email: ${existingAdmin.email}`);
      console.log("If you need to reset the admin password, delete this admin first.");
      process.exit(0);
    }

    // Get admin details from command line arguments or use defaults
    const username = process.argv[2] || "admin";
    const email = process.argv[3] || "admin@university.kz";
    const password = process.argv[4] || "admin123";
    const firstName = process.argv[5] || "System";
    const lastName = process.argv[6] || "Administrator";

    // Validate input
    if (password.length < 6) {
      console.error("Password must be at least 6 characters long");
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const adminUser = new User({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      gender: "other",
      customGender: "Not specified",
      dateOfBirth: new Date("1980-01-01"),
      role: "admin",
      isActive: true,
    });

    await adminUser.save();

    console.log("✅ Admin user created successfully!");
    console.log("==========================================");
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Name: ${firstName} ${lastName}`);
    console.log("==========================================");
    console.log("⚠️  IMPORTANT: Change the default password after first login!");
    console.log(`Login at: http://localhost:${process.env.PORT || 3000}/login`);

  } catch (error) {
    console.error("Error creating admin:", error);
    
    if (error.code === 11000) {
      console.error("Username or email already exists. Please choose different credentials.");
    }
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
}

// Usage information
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log("Create Admin User Script");
  console.log("========================");
  console.log("");
  console.log("Usage:");
  console.log("  node scripts/createAdmin.js [username] [email] [password] [firstName] [lastName]");
  console.log("");
  console.log("Examples:");
  console.log("  node scripts/createAdmin.js");
  console.log("  node scripts/createAdmin.js admin admin@university.kz mypassword123");
  console.log("  node scripts/createAdmin.js superadmin super@university.kz securepass123 John Doe");
  console.log("");
  console.log("Default values:");
  console.log("  username: admin");
  console.log("  email: admin@university.kz");
  console.log("  password: admin123");
  console.log("  firstName: System");
  console.log("  lastName: Administrator");
  console.log("");
  process.exit(0);
}

createAdmin();