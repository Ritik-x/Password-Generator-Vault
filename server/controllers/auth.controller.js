import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ message: "email already register" });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashPassword,
    });
    const jwtsecret = process.env.JWT_SECRET;
    if (!jwtsecret) {
      return res.status(500).json({ message: "JWT secret not configured" });
    }

    const token = jwt.sign({ id: user._id }, jwtsecret, { expiresIn: "7d" });
    res.cookie("token", token, {});

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id, // ❌ pehle _id likha tha
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "registeration falied",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if ((!email, !password)) {
      return res.status(400).json({ message: "enter password or email" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({
        message: "enter a valid password",
      });
    }
    const jwtSecret = process.env.JWT_SECRET;

    const token = jwt.sign({ id: user._id, email: user.email }, jwtSecret, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });
    res.status(200).json({
      message: "user logged in successfully",
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
