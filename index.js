//index.js
const express = require("express");
const { connectToMongoDB } = require("./connect");
const urlRoute = require("./routes/url");
const URL = require("./models/url");
const path = require("path");

const app = express();
const PORT = 8001;

connectToMongoDB("mongodb://127.0.0.1:27017/qr-url")
  .then(() => console.log("Mongodb connected to qr-url"))
  .catch((error) => console.error("Failed to connect to MongoDB", error));

app.use(express.json());
app.use("/url", urlRoute);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

app.get("/:ShortId", async (req, res) => {
  try {
    const { ShortId } = req.params;
    const entry = await URL.findOneAndUpdate(
      { ShortId },
      {
        $push: {
          visitedHistroy: {
            timestamp: Date.now(),
          },
        },
      },
      { new: true }
    );

    if (entry) {
      // Redirect according to the type of QR code
      if (entry.type === "URL") {
        res.redirect(entry.redirectURL);
      } else if (entry.type === "Whatsapp") {
        res.redirect(`https://wa.me/${entry.redirectURL}`);
      } else if (entry.type === "Location") {
        res.redirect(`https://www.google.com/maps?q=${entry.redirectURL}`);
      } else if (entry.type === "Email") {
        res.redirect(`mailto:${entry.redirectURL}`);
      } else if (entry.type === "Text") {
        res.send(`<pre>${entry.redirectURL}</pre>`);
      } else if (entry.type === "WiFi") {
        res.send(`<pre>${entry.redirectURL}</pre>`);
      }
    } else {
      res.status(404).json({ error: "URL not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`));
