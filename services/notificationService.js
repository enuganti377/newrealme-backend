const admin = require("../config/firebase");
const { tokens } = require("../routes/notificationRoutes");

const sendNotification = async (title, body) => {
  try {
    for (let token of tokens) {
      const message = {
        token: token,   
        notification: {
          title,
          body,
        },
      };

      await admin.messaging().send(message);
    }

    console.log("Notification sent to all users");

  } catch (err) {
    console.error("Notification error:", err);
  }
};

module.exports = { sendNotification };
