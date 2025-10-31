import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { getUploader, getFileUrl } from "../middleware/upload.js";
dotenv.config();
import Job from "../models/Job.js";
import { sendMail } from "../utils/Email.js";


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
        //const avatar = req.file ? req.file.path : null;
        let avatar = null;
        if (req.file && req.file.key) {
          avatar = getFileUrl(process.env.MINIO_BUCKET || "serviceconnect-files", req.file.key);
        }

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

        // ===============================
        // ✉️ Send email notifications
        // ===============================
        try {
          console.log("📨 Sending welcome email to:", user.email, "Role:", role);
          // 1️⃣ Notify the user
          const userSubject =
            role === "provider"
              ? "Welcome to Service Connect – Start Your Onboarding!"
              : "Welcome to Service Connect – Find Trusted Service Providers!";

          const userHtml =
            role === "provider"
              ? `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                  <h2>Welcome to Service Connect, ${name} 👋</h2>
                  <p>We're excited to have you onboard as a service provider!</p>
                  <p>To get started, please <strong>log in</strong> and complete your onboarding process. You’ll need to upload your proof documents, profile photo, and service details so homeowners can start hiring you.</p>
                  <p>We encourage you to make your profile stand out by adding clear service rates and a detailed description of your expertise.</p>
                  <p>Need help? Visit our <a href="https://serviceconnect.uk/contact" target="_blank">Contact Us</a> page for assistance.</p>
                  <p>Welcome aboard,<br/>The Service Connect Team</p>
                </div>
              `
              : `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                  <h2>Welcome to Service Connect, ${name} 👋</h2>
                  <p>Thank you for joining our platform!</p>
                  <p>You can now log in to your dashboard to <strong>find and hire trusted service providers</strong> in your area or <strong>post a job</strong> to receive proposals from professionals.</p>
                  <p>Please take a moment to review our <a href="https://serviceconnect.uk/terms" target="_blank">Terms & Conditions</a> and <a href="https://serviceconnect.uk/privacy-policy" target="_blank">Privacy Policy</a>.</p>
                  <p>Need help? Visit our <a href="https://serviceconnect.uk/contact" target="_blank">Contact Us</a> page.</p>
                  <p>Welcome to a smarter way to get things done,<br/>The Service Connect Team</p>
                </div>
              `;

          await sendMail(
            user.email,
            userSubject,
            userSubject,
            userHtml
          );

          // 2️⃣ Notify admin/support team
          const adminHtml = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h3>New User Registration</h3>
              <p><strong>Name:</strong> ${user.name}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Role:</strong> ${role}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p>Check the admin dashboard for more details.</p>
            </div>
          `;

          await sendMail(
             process.env.EMAIL_USER,// internal notification address
            `New ${role} Registered – ${name}`,
            `A new ${role} has registered.`,
            adminHtml
          );
        } catch (emailError) {
          console.error("⚠️ Email sending failed:", emailError);
        }


        await Job.updateMany(
          { clientEmail: email, client: { $exists: false } },
          { $set: { client: user._id } }
        );

        res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
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
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        if (user.isBanned) {
            return res.status(403).json({
              message: `Your account is suspended. ${user.banReason ? "Reason: " + user.banReason : ""}`,
            });
          }

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