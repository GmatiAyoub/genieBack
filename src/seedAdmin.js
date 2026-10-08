import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const run = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, MONGO_URI } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("❌ ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis dans .env");
    process.exit(1);
  }
  if (ADMIN_PASSWORD.length < 12) {
    console.error("❌ Le mot de passe admin doit contenir au moins 12 caractères");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);

  const email = ADMIN_EMAIL.toLowerCase();
  const exists = await User.findOne({ email });
  if (exists) {
    console.log("L'Admin existe déjà");
    process.exit();
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.create({
    nom: ADMIN_NAME || "Admin",
    email,
    password: hashed,
    role: "admin",
  });

  console.log(`✅ Admin créé : ${email}`);
  process.exit();
};

run();