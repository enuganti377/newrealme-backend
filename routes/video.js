router.post("/video", upload.single("video"), async (req, res) => {
  const sendNotification = require("../services/notification");

  const { title, location, type } = req.body;

  const result = await cloudinary.uploader.upload(req.file.path, {
    resource_type: "video"
  });

  const video = await News.create({
    title,
    videoUrl: result.secure_url,
    location,
    type,
    contentType: "video",
    isManual: true,
    publishedAt: new Date()
  });

  await sendNotification(video); 

  res.json(video);
});