const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

app.get("/", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Query missing" });

  try {
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36"
    };

    const searchUrl = `https://en.aptoide.com/search/view?search=${encodeURIComponent(query)}`;
    const searchRes = await axios.get(searchUrl, { headers });

    const $ = cheerio.load(searchRes.data);
    const firstApp = $("a.card").first();
    const appPath = firstApp.attr("href");
    if (!appPath) return res.status(404).json({ error: "App not found" });

    const appUrl = `https://en.aptoide.com${appPath}`;
    const appRes = await axios.get(appUrl, { headers });

    const $$ = cheerio.load(appRes.data);
    const appName = $$("h1").first().text().trim();
    const downloadButton = $$("a").filter((i, el) => $$(el).text().includes("Download APK")).first();
    const downloadLink = downloadButton.attr("href");

    if (!downloadLink) return res.status(404).json({ error: "Download link not found" });

    res.json({
      name: appName,
      download: downloadLink.startsWith("http") ? downloadLink : `https://en.aptoide.com${downloadLink}`
    });
  } catch (e) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = app;
