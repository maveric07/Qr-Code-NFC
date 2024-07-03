const express = require("express");
const { handleGenerateNewShortURL } = require("../controllers/url");
const path = require("path");
const URL = require("../models/url");
const router = express.Router();

// Route to handle generating new short URLs
router.post("/", handleGenerateNewShortURL);

// Route to get the QR code by ShortId
router.get("/qr/:ShortId", async (req, res) => {
  const { ShortId } = req.params;
  try {
    const entry = await URL.findOne({ ShortId });
    if (!entry) {
      return res.status(404).json({ error: "QR code not found" });
    }
    return res.json({
      qrCode: entry.qrCodeURL,
      activationDate: entry.activationDate.toISOString(),
      expiryDate: entry.expiryDate.toISOString(),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Route to serve the HTML page for viewing the QR code
router.get("/view/:ShortId", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/view.html"));
});

// Route to fetch visit history data for the report
router.get("/report/data/:ShortId", async (req, res) => {
  const { ShortId } = req.params;
  try {
    const url = await URL.findOne({ ShortId });
    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    // Aggregate visit history data by day
    const visitHistory = url.visitedHistroy.reduce((acc, visit) => {
      const date = new Date(visit.timestamp).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date]++;
      return acc;
    }, {});

    const labels = Object.keys(visitHistory);
    const data = Object.values(visitHistory);

    res.json({
      labels,
      data,
      activationDate: url.activationDate.toISOString(),
      expiryDate: url.expiryDate.toISOString(),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Route to serve the HTML page for the visit history report
router.get("/report/view/:ShortId", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/report.html"));
});

// Route to handle redirection based on ShortId
router.get("/:ShortId", async (req, res) => {
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
      const currentDate = new Date();
      if (entry.isInactive || currentDate > entry.expiryDate) {
        return res
          .status(410)
          .json({ error: "QR code is inactive or expired" });
      }

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

module.exports = router;

// // routes/url.js
// const express = require("express");
// const { handleGenerateNewShortURL } = require("../controllers/url");
// const path = require("path");
// const URL = require("../models/url");
// const router = express.Router();

// // Route to handle generating new short URLs
// router.post("/", handleGenerateNewShortURL);

// // Route to get the QR code by ShortId
// router.get("/qr/:ShortId", async (req, res) => {
//   const { ShortId } = req.params;
//   try {
//     const entry = await URL.findOne({ ShortId });
//     if (!entry) {
//       return res.status(404).json({ error: "QR code not found" });
//     }
//     return res.json({ qrCode: entry.qrCodeURL });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// });

// // Route to serve the HTML page for viewing the QR code
// router.get("/view/:ShortId", (req, res) => {
//   res.sendFile(path.join(__dirname, "../public/view.html"));
// });

// // Route to fetch visit history data for the report
// router.get("/report/data/:ShortId", async (req, res) => {
//   const { ShortId } = req.params;
//   try {
//     const url = await URL.findOne({ ShortId });
//     if (!url) {
//       return res.status(404).json({ error: "URL not found" });
//     }

//     // Aggregate visit history data by day
//     const visitHistory = url.visitedHistroy.reduce((acc, visit) => {
//       const date = new Date(visit.timestamp).toLocaleDateString();
//       if (!acc[date]) {
//         acc[date] = 0;
//       }
//       acc[date]++;
//       return acc;
//     }, {});

//     const labels = Object.keys(visitHistory);
//     const data = Object.values(visitHistory);

//     res.json({ labels, data });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// });

// // Route to serve the HTML page for the visit history report
// router.get("/report/view/:ShortId", (req, res) => {
//   res.sendFile(path.join(__dirname, "../public/report.html"));
// });

// // Route to handle redirection based on ShortId
// router.get("/:ShortId", async (req, res) => {
//   try {
//     const { ShortId } = req.params;
//     const entry = await URL.findOneAndUpdate(
//       { ShortId },
//       {
//         $push: {
//           visitedHistroy: {
//             timestamp: Date.now(),
//           },
//         },
//       },
//       { new: true }
//     );

//     if (entry) {
//       const currentDate = new Date();
//       if (entry.isInactive || currentDate > entry.expiryDate) {
//         return res
//           .status(410)
//           .json({ error: "QR code is inactive or expired" });
//       }

//       // Redirect according to the type of QR code
//       if (entry.type === "URL") {
//         res.redirect(entry.redirectURL);
//       } else if (entry.type === "Whatsapp") {
//         res.redirect(`https://wa.me/${entry.redirectURL}`);
//       } else if (entry.type === "Location") {
//         res.redirect(`https://www.google.com/maps?q=${entry.redirectURL}`);
//       } else if (entry.type === "Email") {
//         res.redirect(`mailto:${entry.redirectURL}`);
//       } else if (entry.type === "Text") {
//         res.send(`<pre>${entry.redirectURL}</pre>`);
//       } else if (entry.type === "WiFi") {
//         res.send(`<pre>${entry.redirectURL}</pre>`);
//       }
//     } else {
//       res.status(404).json({ error: "URL not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;
