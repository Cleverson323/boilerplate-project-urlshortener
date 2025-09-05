require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
const { URL, domainToASCII } = require("url");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.use(express.urlencoded({ extended: false }));

let savedUrls = {
  1: "https://forum.freecodecamp.org/",
};

const isValidUrl = async (input) => {
  try {
    const parsedUrl = new URL(input);
    const hostName = domainToASCII(parsedUrl.hostname);
    const validHostname = await new Promise((resolve) => {
      dns.lookup(hostName, (err, _address) => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
    return validHostname;
  } catch (err) {
    return false;
  }
};

app.post("/api/shorturl", async (req, res) => {
  const originalUrl = req.body.url;

  const nextId = Object.keys(savedUrls).length + 1;

  if (await isValidUrl(originalUrl)) {
    savedUrls[nextId] = originalUrl;
    res.json({ original_url: originalUrl, short_url: nextId });
  } else {
    res.json({ error: "invalid url" });
  }
});

app.get("/api/shorturl/:shortedUrl", (req, res) => {
  const shortedUrl = req.params.shortedUrl;
  if (savedUrls[shortedUrl]) {
    res.redirect(savedUrls[shortedUrl]);
  } else {
    res.json({ error: "No short URL found for the given input" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
