const User = require("../models/User");

const sendNotification = async (item) => {
  try {
    if (!item.isManual) return; // ❌ ignore RSS

    let users = [];

    if (item.type === "local") {
      // 📍 Local + general users
      users = await User.find({
        $or: [
          { location: item.location },
          { location: "general" }
        ]
      });
    } else {
      // 🌍 General → all users
      users = await User.find();
    }

    const messages = users.map(user => ({
      to: user.token,
      sound: "default",
      title: item.contentType === "video"
        ? `🎥 ${item.title}`
        : `🔴 ${item.title}`,
      body: "Tap to open",
      data: {
        id: item._id,
        type: item.contentType
      }
    }));

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(messages)
    });

  } catch (err) {
    console.log("Notification Error:", err.message);
  }
};

module.exports = sendNotification;