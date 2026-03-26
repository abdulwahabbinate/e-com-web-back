require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const env = require("../config/env");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);

    const existingAdmin = await User.findOne({
      email: env.SUPER_ADMIN_EMAIL.toLowerCase().trim(),
      role: "admin",
    });

    if (existingAdmin) {
      console.log("Super admin already exists in users collection");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(env.SUPER_ADMIN_PASSWORD, 10);

    const fullName = String(env.SUPER_ADMIN_NAME || "Super Admin").trim();
    const nameParts = fullName.split(" ");
    const firstName = nameParts[0] || "Super";
    const lastName = nameParts.slice(1).join(" ") || "Admin";

    await User.create({
      first_name: firstName,
      last_name: lastName,
      email: env.SUPER_ADMIN_EMAIL.toLowerCase().trim(),
      password: hashedPassword,
      role: "admin",
      avatar: "",
      phone: "",
      bio: "",
      device_token: "",
      device_type: "",
      location: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      gender: "",
      is_verified: true,
      is_profile_completed: true,
      is_notification_enabled: true,
      terms_and_conditions: true,
      privacy_policy: true,
    });

    console.log("Super admin created successfully in users collection");
    process.exit(0);
  } catch (error) {
    console.error("Seed admin error:", error.message);
    process.exit(1);
  }
};

seedAdmin();