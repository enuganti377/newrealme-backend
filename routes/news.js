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
      await sendNotification(title,imageUrl);
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

    page = parseInt(page);
    limit = parseInt(limit);

    // ======================
    // NORMALIZE INPUT
    // ======================
    location = location ? location.trim().toLowerCase() : null;
    mandal = mandal ? mandal.trim().toLowerCase() : null;
    category = category ? category.trim().toLowerCase() : null;

    // ======================
    // BASE FILTER
    // ======================
    let filter = {
      ...(category && category !== "all" ? { category } : {})
    };

    // 🔥 NEW NEWS SUPPORT
    if (afterTime) {
      filter.publishedAt = { $gt: new Date(afterTime) };
    }

    // ======================
    // FETCH ALL NEWS (LATEST FIRST)
    // ======================
    const allNews = await News.find(filter).sort({ publishedAt: -1 });

    // ======================
    // PRIORITY LOGIC
    // ======================
    const prioritized = allNews.map((item) => {
      let priority = 3;

      if (
        item.isManual &&
        mandal &&
        item.mandal &&
        item.mandal.toLowerCase().trim() === mandal
      ) {
        priority = 1;
      } else if (
        item.isManual &&
        location &&
        item.location &&
        item.location.toLowerCase().trim() === location
      ) {
        priority = 2;
      }

      return { ...item._doc, priority };
    });

    // ======================
    // SORT BY PRIORITY + LATEST
    // ======================
    prioritized.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });

    // ======================
    // SPLIT DATA
    // ======================
    const rssNews = prioritized.filter(item => !item.isManual);
    const manualNews = prioritized.filter(item => item.isManual);

    // ======================
    // APPLY GLOBAL PATTERN (2 RSS + 1 LOCAL)
    // ======================
    let mixed = [];
    let r = 0;
    let m = 0;

    while (r < rssNews.length || m < manualNews.length) {
      // 🔥 2 RSS
      for (let i = 0; i < 2 && r < rssNews.length; i++) {
        mixed.push(rssNews[r++]);
      }

      // 🔥 1 LOCAL
      if (m < manualNews.length) {
        mixed.push(manualNews[m++]);
      }
    }

    // ======================
    // PAGINATION (IMPORTANT)
    // ======================
    const start = (page - 1) * limit;
    const end = start + limit;

    const finalFeed = mixed.slice(start, end);

    // ======================
    // RESPONSE
    // ======================
    res.json(finalFeed);

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
