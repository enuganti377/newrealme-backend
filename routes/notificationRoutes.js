const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notificationController");

let tokens = [];

router.post("/save-token", (req, res) => {
  const { token } = req.body;

  if (!tokens.includes(token)) {
    tokens.push(token);
  }

  console.log("TOKENS:", tokens);

  res.json({ success: true });
});

router.post("/send", notificationController.send);

module.exports = { router, tokens };
