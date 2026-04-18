const News = require("../models/News");
const sendNotification = require("../services/notification"); // if you created

const postnews = async (req, res) => {
  try {
    const { title, description, imageUrl, category, source, location, type } = req.body;

    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "title, description, and category are required",
      });
    }

    // Create news
    const news = await News.create({
      title,
      description,
      imageUrl,
      category,
      source,
      location: location || "general", 
      type: type || "general",          
      isManual: true,                  
      publishedAt: new Date()
    });

    // 🔔 Send notification
    await sendNotification(news);

    return res.status(201).json({
      success: true,
      message: "News posted successfully",
      data: news,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to post news",
    });
  }
};

module.exports = { postnews };