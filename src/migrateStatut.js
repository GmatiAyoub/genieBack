import mongoose from "mongoose";
import dotenv from "dotenv";
import Book from "./models/Book.js";
import Article from "./models/Article.js";
import User from "./models/User.js";

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const admin = await User.findOne({ role: "admin" });

  const booksResult = await Book.updateMany(
    { statut: { $exists: false } },
    { $set: { statut: "Validé", contributeur: admin?._id } }
  );
  const articlesResult = await Article.updateMany(
    { statut: { $exists: false } },
    { $set: { statut: "Validé", contributeur: admin?._id } }
  );

  console.log(`✅ ${booksResult.modifiedCount} livre(s) mis à jour`);
  console.log(`✅ ${articlesResult.modifiedCount} article(s) mis à jour`);
  process.exit();
};

run();