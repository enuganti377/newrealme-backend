const express = require("express");
const router = express.Router();
const Token = require("../models/Token");

router.post("/save-token", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token required" });
    }

    const exists = await Token.findOne({ token });

    if (!exists) {
      await Token.create({ token });
      console.log("New token saved:", token);
    } else {
      console.log("Token already exists");
    }

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router };
