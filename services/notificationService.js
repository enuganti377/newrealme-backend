const admin = require("../config/firebase");
const Token = require("../models/Token");

const sendNotification = async (title, body, imageUrl) => {
  try {
    const tokensData = await Token.find();
    const tokens = tokensData.map((t) => t.token);

    if (tokens.length === 0) {
      console.log("No tokens found");
      return;
    }

    const message = {
      tokens: tokens,

      notification: {
        title: title,
        body: body,
      },

      android: {
        notification: {
          channelId: "default",

          // IMPORTANT → must match file name (notification-icon.png → notification_icon)
          smallIcon: "notification_icon",

          // BIG IMAGE (expanded view)
          imageUrl: imageUrl,

          priority: "high",
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    console.log("Notification sent:", response);
  } catch (err) {
    console.log("Notification error:", err);
  }
};

module.exports = { sendNotification };
