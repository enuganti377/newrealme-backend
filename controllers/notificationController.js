const { sendNotification } = require("../services/notificationService");

exports.send = async (req, res) => {
  try {
    const { title, body } = req.body;

    const response = await sendNotification(title, body);

    res.json({
      success: true,
      response,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};