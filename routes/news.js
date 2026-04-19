const express = require("express");
const router = express.Router();

const News = require("../models/News");


// ======================
// POST MANUAL NEWS
// ======================
const { sendNotification } = require("../services/notificationService");

router.post("/manual", async (req, res) => {
  try {
    const body = req.body || {};

    let {
      title,
      description,
      imageUrl,
      location,
      mandal,
      category,
      sendNotification: shouldSend
    } = body;

    if (!title || !description || !imageUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    location = location ? location.trim().toLowerCase() : "general";
    mandal = mandal ? mandal.trim().toLowerCase() : null;

    const news = await News.create({
      title,
      description,
      imageUrl,
      location,
      mandal,
      category: category ? category.toLowerCase() : "general",
      isManual: true,
      publishedAt: new Date()
    });

    // 🔔 SEND NOTIFICATION
   if (shouldSend) {
  await sendNotification(
    title,
    "",
    imageUrl || "https://images.unsplash.com/photo-1504711434969-e33886168f5c"
  );
}

    res.json(news);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ======================
// GET FEED (FULL UPDATED)
// ======================
router.get("/feed", async (req, res) => {
  try {
    let { location, mandal, category, page = 1, limit = 10, afterTime } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    // normalize input
    location = location ? location.trim().toLowerCase() : null;
    mandal = mandal ? mandal.trim().toLowerCase() : null;
    category = category ? category.trim().toLowerCase() : null;

    // base filter
    let filter = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (location) {
      filter.location = location;
    }

    if (mandal) {
      filter.mandal = mandal;
    }

    // new news support
    if (afterTime) {
      filter.publishedAt = { $gt: new Date(afterTime) };
    }

    // ✅ DB LEVEL PAGINATION (FAST)
    const news = await News.find(filter)
      .sort({ publishedAt: -1 }) // latest first
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(news);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
// ======================
// GET SINGLE NEWS
// ======================
router.get("/:id", async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ error: "News not found" });
    }

    res.json(news);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
