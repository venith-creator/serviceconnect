import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { getUploader } from "../middleware/upload.js";
dotenv.config();


const generateToken = (id, roles) => {
  return jwt.sign({ id, roles }, process.env.JWT_SECRET, { expiresIn: "3d" });
}

export const registerUser = async (req, res) => {
    try {
        const { name, phone, email, password, role, secretCode } = req.body;
        const allowedRoles = ["client", "provider", "admin"];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid role. Must be client, provider or admin" });
        }

        let services = [];
        if (role === "provider" && req.body.services) {
            try {
                services = JSON.parse(req.body.services);
            }catch {
                return res.status(400).json({ message: "invalid services format" });
            }
            if (!Array.isArray(services) || !services.every(s => typeof s === 'string')) {
                return res.status(400).json({ message: "Services must be an array of strings" });
            }
        }
            if (role === "admin") {
            if (!secretCode) {
                return res.status(400).json({ message: "Missing secret code for admin registration" });
            }
            if (secretCode !== process.env.ADMIN_SECRET_CODE) {
                return res.status(403).json({ message: "Incorrect secret code for admin registration" });
            }
            }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const avatar = req.file ? req.file.path : null;

        const roles = [role || "client"];

        const user = await User.create({
            name,
            phone,
            email,
            password: hashedPassword,
            roles,
            avatar,
            services,
            providerOnboarding: role === "provider" ? false : undefined
        });

        await Job.updateMany(
          { clientEmail: email, client: { $exists: false } },
          { $set: { client: user._id } }
        );

        res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        providerOnboarding: user.providerOnboarding,
        token: generateToken(user._id, user.roles),
        });    
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        providerOnboarding: user.providerOnboarding,
        token: generateToken(user._id, user.roles),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 

export const addRole = async (req, res) => {
  try {
    const { newRole } = req.body;
    const allowedRoles = ["client", "provider"];

    if (!allowedRoles.includes(newRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.roles.includes(newRole)) {
      user.roles.push(newRole);
      if (newRole === "provider") {
        user.providerOnboarding = false; // must complete docs
      }
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      providerOnboarding: user.providerOnboarding,
      token: generateToken(user._id, user.roles),
      mustConfirm: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const upload = getUploader("avatars");