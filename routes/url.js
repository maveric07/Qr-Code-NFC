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

// module.exports = router;

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
    return res.json({ qrCode: entry.qrCodeURL });
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

    res.json({ labels, data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Route to serve the HTML page for the visit history report
router.get("/report/view/:ShortId", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/report.html"));
});

module.exports = router;
