import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const exists = await User.findOne({ email: "ismail@geniebac.com" });
  if (exists) {
    console.log("L'Admin existe déjà");
    process.exit();
  }

  const hashed = await bcrypt.hash("motdepasse123", 10); // ⚠️ change-le après le premier login
  await User.create({
    nom: "Ismail",
    email: "ismail@geniebac.com",
    password: hashed,
    role: "admin",
  });

  console.log("✅ Admin créé : ismail@geniebac.com / motdepasse123");
  process.exit();
};

run();