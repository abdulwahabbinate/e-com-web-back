require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const env = require("../config/env");
const Admin = require("../models/Admin");

const seedAdmin = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);

    const existingAdmin = await Admin.findOne({
      email: env.SUPER_ADMIN_EMAIL.toLowerCase(),
    });

    if (existingAdmin) {
      console.log("Super admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(env.SUPER_ADMIN_PASSWORD, 10);

    await Admin.create({
      name: env.SUPER_ADMIN_NAME,
      email: env.SUPER_ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
    });

    console.log("Super admin created successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seed admin error:", error.message);
    process.exit(1);
  }
};

seedAdmin();