const admin = require("../config/firebase");

const sendNotification = async (title, body) => {
  const message = {
    notification: {
      title,
      body,
    },
    topic: "news",
  };

  return await admin.messaging().send(message);
};

module.exports = { sendNotification };