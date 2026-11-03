import { app } from "../config/firebase.js";
import User from "../models/user.model.js";
import {getAuth} from "firebase-admin/auth";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const {token:firebasetoken} = req.body;
    if(!firebasetoken) {
      return res.status(400).json({ message: "Token is required" });
    }
    const decodedToken = await getAuth(app).verifyIdToken(firebasetoken);
    const user = await User.findOneAndUpdate(
      { firebaseId: decodedToken.uid },
      {
        $set: {
          name: decodedToken.name || decodedToken.email?.split("@")[0] || "User",
          email: decodedToken.email,
          profileImage: decodedToken.picture,
        },
        $setOnInsert: { firebaseId: decodedToken.uid },
      },
      { new: true, upsert: true, returnDocument: "after" }
    );
  
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.status(200).json({ message: "Login successful", token, user });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}
export const logout = (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" });
  res.status(200).json({ message: "Logout successful" }); 
  
}

export const me = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}