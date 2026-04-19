const admin = require("../config/firebase");
const Token = require("../models/Token");

const sendNotification = async (title, imageUrl) => {
  try {
    // 1. Get all tokens from DB
    const tokensData = await Token.find();
    const tokens = tokensData.map((t) => t.token);

    if (tokens.length === 0) {
      console.log("No tokens found");
      return;
    }

    // 2. Create clean notification payload
    const message = {
      notification: {
        title: title,
        body: "", // 🔥 keep empty for clean UI
        imageUrl: imageUrl, // 🔥 big image
      },

      android: {
        notification: {
          channelId: "news",
          priority: "high",
          imageUrl: imageUrl, // 🔥 required for Android image
        },
      },

      tokens: tokens,
    };

    // 3. Send notification
    const response = await admin
      .messaging()
      .sendEachForMulticast(message);

    console.log("Notification sent:", response);
  } catch (err) {
    console.log("Notification error:", err);
  }
};

module.exports = { sendNotification };
