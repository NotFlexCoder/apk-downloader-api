const express = require("express");
const axios = require("axios");

const app = express();

app.get("/", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Query missing" });

  try {
    const url = `https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(query)}&limit=1`;
    const response = await axios.get(url);
    const data = response.data;

    if (!data || !data.list || !data.list.apps || !data.list.apps.length) {
      return res.status(404).json({ error: "App not found" });
    }

    const app = data.list.apps[0];
    res.json({
      name: app.name,
      package: app.package,
      version: app.file.vername,
      size: app.file.filesize,
      icon: app.icon,
      download: app.file.path
    });
  } catch {
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = app;
