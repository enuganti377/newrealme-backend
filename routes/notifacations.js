const sendNotification = require("../services/notification");

router.post("/manual", async (req, res) => {
  const { title, description, imageUrl, location, type } = req.body;

  const news = await News.create({
    title,
    description,
    imageUrl,
    location,
    type,
    contentType: "news",
    isManual: true,
    publishedAt: new Date()
  });

  await sendNotification(news); 

  res.json(news);
});