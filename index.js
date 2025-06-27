const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

app.get('/', async (req, res) => {
  const { appname } = req.query;
  if (!appname) return res.json({ error: 'No appname provided' });

  try {
    const searchUrl = `https://en.aptoide.com/search/view?q=${encodeURIComponent(appname)}`;
    const searchHtml = await axios.get(searchUrl);
    const $ = cheerio.load(searchHtml.data);

    const appPath = $('a[data-testid="searchAppCardLink"]').attr('href');
    if (!appPath) return res.json({ error: 'App not found' });

    const appUrl = `https://en.aptoide.com${appPath}`;
    const appHtml = await axios.get(appUrl);
    const $$ = cheerio.load(appHtml.data);

    const apkLink = $$('a[data-testid="DownloadButton"]').attr('href');
    const title = $$('h1').first().text();
    const icon = $$('img[alt="App icon"]').attr('src');

    if (!apkLink) return res.json({ error: 'Download link not found' });

    res.json({
      title,
      icon,
      apk: apkLink.startsWith('http') ? apkLink : `https://en.aptoide.com${apkLink}`
    });
  } catch (err) {
    res.json({ error: 'Something went wrong', details: err.message });
  }
});

module.exports = app;
