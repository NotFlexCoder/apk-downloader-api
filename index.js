const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

app.get("/", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Query missing" });

  try {
    const searchUrl = `https://en.aptoide.com/search/view?search=${encodeURIComponent(query)}`;
    const searchRes = await axios.get(searchUrl);
    const $ = cheerio.load(searchRes.data);
    const firstAppLink = $("a.card").first().attr("href");
    if (!firstAppLink) return res.status(404).json({ error: "App not found" });

    const appPage = await axios.get(`https://en.aptoide.com${firstAppLink}`);
    const $$ = cheerio.load(appPage.data);
    const appName = $$("h1").first().text().trim();
    const apkUrl = $$("a:contains('Download APK')").attr("href");

    if (!apkUrl) return res.status(404).json({ error: "Download link not found" });

    res.json({
      name: appName,
      download: apkUrl.startsWith("http") ? apkUrl : `https://en.aptoide.com${apkUrl}`
    });
  } catch {
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = app;
