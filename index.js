const express = require("express");
const axios = require("axios");

const app = express();

app.get("/", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Query missing" });

  try {
    const searchUrl = `https://ws2.aptoide.com/api/6/bulkRequest/api_list/search?query=${encodeURIComponent(query)}&limit=1`;

    const response = await axios.get(searchUrl);
    const apps = response.data?.responses?.[0]?.data?.list;

    if (!apps || apps.length === 0) {
      return res.status(404).json({ error: "App not found" });
    }

    const appData = apps[0];

    res.json({
      name: appData.name,
      package: appData.package,
      version: appData.file.vername,
      size: appData.file.filesize,
      icon: appData.icon,
      download: appData.file.path
    });
  } catch (e) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = app;
