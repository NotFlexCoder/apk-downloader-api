const express = require("express");
const axios = require("axios");

const app = express();

app.get("/", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Query missing" });

  try {
    const apiUrl = `https://web-api-cache.aptoide.com/search?query=${encodeURIComponent(query)}&country=en&mature=false`;
    const response = await axios.get(apiUrl);

    const apps = response.data?.d?.apps;
    if (!apps || apps.length === 0) return res.status(404).json({ error: "App not found" });

    const appData = apps[0];
    const downloadUrl = appData?.file?.path;

    if (!downloadUrl) return res.status(404).json({ error: "Download link not found" });

    res.json({
      name: appData.name,
      package: appData.package,
      version: appData.file.vername,
      size: appData.file.filesize,
      icon: appData.icon,
      download: downloadUrl
    });
  } catch {
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = app;
