const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  subscription: user.subscription || {
    plan: "free",
    status: "inactive",
    startAt: null,
    endAt: null,
  },
});

exports.register = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!name || !email || !password) return res.status(400).json({ success: false, message: "All fields are required" });
    if (password.length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    if (await User.findOne({ email })) return res.status(400).json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json({ success: true, message: "User registered successfully", user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    if (!email || !password) return res.status(400).json({ success: false, message: "Please fill all fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, message: "Login successful", token, user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
