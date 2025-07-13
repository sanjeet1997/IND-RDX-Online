
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/indrdx", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  phone: { type: String, unique: true },
  password: { type: String, default: "123456" },
  coins: { type: Number, default: 100 },
  joined: { type: Boolean, default: false }
});
const User = mongoose.model("User", userSchema);

app.post("/signup", async (req, res) => {
  const { phone } = req.body;
  try {
    if (await User.findOne({ phone })) {
      return res.status(400).json({ message: "Phone already registered" });
    }
    const newUser = new User({ phone });
    await newUser.save();
    res.json({ message: "Signup successful", user: newUser });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  const { phone, password } = req.body;
  try {
    const user = await User.findOne({ phone, password });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    res.json({ message: "Login successful", user });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/join", async (req, res) => {
  const { phone } = req.body;
  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.joined) return res.json({ message: "Already joined" });
    if (user.coins < 10) return res.json({ message: "Not enough coins" });
    user.coins -= 10;
    user.joined = true;
    await user.save();
    res.json({ message: "Joined successfully", coins: user.coins });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(5000, () => console.log("Server running at http://localhost:5000"));
