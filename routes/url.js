// //in this route page view and viewAll  both woking but different url
//routes/url.js

// routes/url.js
const express = require("express");
const { handleGenerateNewShortURL } = require("../controllers/url");
const path = require("path");
const URL = require("../models/url");
const router = express.Router();

// Route to handle generating new short URLs
router.post("/", handleGenerateNewShortURL);

// Route to get all URLs for a specific user
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const urls = await URL.find({ userId });
    if (!urls || urls.length === 0) {
      return res.status(404).json({ error: "No URLs found for this user" });
    }
    const formattedUrls = urls.map((url) => ({
      id: url.ShortId,
      qrCode: url.qrCodeURL,
      shortDescription: url.shortDescription,
    }));
    res.json(formattedUrls);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Route to get the QR code by ShortId
router.get("/qr/:ShortId", async (req, res) => {
  const { ShortId } = req.params;
  try {
    const entry = await URL.findOne({ ShortId });
    if (!entry) {
      return res.status(404).json({ error: "QR code not found" });
    }

    // Check if QR code has expired
    const currentDate = new Date();
    if (currentDate > entry.expiryDate) {
      entry.isInactive = true;
      await entry.save();
    }

    return res.json({
      qrCode: entry.qrCodeURL,
      activationDate: entry.activationDate.toISOString(),
      expiryDate: entry.expiryDate.toISOString(),
      isInactive: entry.isInactive,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Route to activate the QR code by ShortId
router.patch("/activate/:ShortId", async (req, res) => {
  const { ShortId } = req.params;
  try {
    const entry = await URL.findOneAndUpdate(
      { ShortId },
      {
        isInactive: false,
        activationDate: new Date(),
        expiryDate: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes from now
      },
      { new: true }
    );
    if (!entry) {
      return res.status(404).json({ error: "QR code not found" });
    }
    res.json({
      message: "QR code activated",
      qrCode: entry.qrCodeURL,
      activationDate: entry.activationDate.toISOString(),
      expiryDate: entry.expiryDate.toISOString(),
      isInactive: entry.isInactive,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Route to serve the HTML page for viewing a single QR code with userID and shortID
router.get("/view/user/:userId/:ShortId", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/view.html"));
});

// Route to serve the HTML page for viewing all QR codes for a user
router.get("/view/user/:userId", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/viewAll.html"));
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
router.get("/report/view/user/:userId/:ShortId", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/report.html"));
});

// Route to handle redirection based on ShortId
router.get("/:ShortId", async (req, res) => {
  try {
    const { ShortId } = req.params;
    const entry = await URL.findOne({ ShortId });

    if (!entry) {
      return res.status(404).send("URL not found");
    }

    if (entry.isInactive) {
      return res.status(403).send("QR code is inactive");
    }

    entry.visitedHistroy.push({ timestamp: new Date() });
    await entry.save();

    res.redirect(entry.redirectURL);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;

// const express = require("express");
// const { handleGenerateNewShortURL } = require("../controllers/url");
// const path = require("path");
// const URL = require("../models/url");
// const router = express.Router();

// // Route to handle generating new short URLs
// router.post("/", handleGenerateNewShortURL);

// // Route to get all URLs for a specific user
// router.get("/:userId", async (req, res) => {
//   const { userId } = req.params;
//   try {
//     const urls = await URL.find({ userId });
//     if (!urls || urls.length === 0) {
//       return res.status(404).json({ error: "No URLs found for this user" });
//     }
//     const formattedUrls = urls.map((url) => ({
//       id: url.ShortId,
//       qrCode: url.qrCodeURL,
//       shortDescription: url.shortDescription,
//     }));
//     res.json(formattedUrls);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// });

// // Route to get the QR code by ShortId
// router.get("/qr/:ShortId", async (req, res) => {
//   const { ShortId } = req.params;
//   try {
//     const entry = await URL.findOne({ ShortId });
//     if (!entry) {
//       return res.status(404).json({ error: "QR code not found" });
//     }

//     // Check if QR code has expired
//     const currentDate = new Date();
//     if (currentDate > entry.expiryDate) {
//       entry.isInactive = true;
//       await entry.save();
//     }

//     return res.json({
//       qrCode: entry.qrCodeURL,
//       activationDate: entry.activationDate.toISOString(),
//       expiryDate: entry.expiryDate.toISOString(),
//       isInactive: entry.isInactive,
//     });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// });

// // Route to activate the QR code by ShortId
// router.patch("/activate/:ShortId", async (req, res) => {
//   const { ShortId } = req.params;
//   try {
//     const entry = await URL.findOneAndUpdate(
//       { ShortId },
//       {
//         isInactive: false,
//         activationDate: new Date(),
//         expiryDate: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes from now
//       },
//       { new: true }
//     );
//     if (!entry) {
//       return res.status(404).json({ error: "QR code not found" });
//     }
//     res.json({
//       message: "QR code activated",
//       qrCode: entry.qrCodeURL,
//       activationDate: entry.activationDate.toISOString(),
//       expiryDate: entry.expiryDate.toISOString(),
//       isInactive: entry.isInactive,
//     });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// });

// // Route to serve the HTML page for viewing a single QR code with userID and shortID
// router.get("/view/user/:userId/:ShortId", (req, res) => {
//   res.sendFile(path.join(__dirname, "../public/view.html"));
// });

// // Route to serve the HTML page for viewing all QR codes for a user
// router.get("/view/user/:userId", (req, res) => {
//   res.sendFile(path.join(__dirname, "../public/viewAll.html"));
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

//     res.json({
//       labels,
//       data,
//       activationDate: url.activationDate.toISOString(),
//       expiryDate: url.expiryDate.toISOString(),
//     });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// });

// // // Route to serve the HTML page for the visit history report
// // router.get("/report/view/:ShortId", (req, res) => {
// //   res.sendFile(path.join(__dirname, "../public/report.html"));
// // });
// // Route to serve the HTML page for the visit history report
// router.get("/report/view/user/:userId/:ShortId", (req, res) => {
//   res.sendFile(path.join(__dirname, "../public/report.html"));
// });

// // Route to handle redirection based on ShortId
// router.get("/:ShortId", async (req, res) => {
//   try {
//     const { ShortId } = req.params;
//     const entry = await URL.findOne({ ShortId });

//     if (!entry) {
//       return res.status(404).send("URL not found");
//     }

//     if (entry.isInactive) {
//       return res.status(403).send("QR code is inactive");
//     }

//     entry.visitedHistroy.push({ timestamp: new Date() });
//     await entry.save();

//     res.redirect(entry.redirectURL);
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

// module.exports = router;

// // //in this route page view and viewAll  both woking but different url
// //routes/url.js
// const express = require("express");
// const { handleGenerateNewShortURL } = require("../controllers/url");
// const path = require("path");
// const URL = require("../models/url");
// const router = express.Router();

// // Route to handle generating new short URLs
// router.post("/", handleGenerateNewShortURL);

// // Route to get all URLs for a specific user
// router.get("/:userId", async (req, res) => {
//   const { userId } = req.params;
//   try {
//     const urls = await URL.find({ userId });
//     if (!urls || urls.length === 0) {
//       return res.status(404).json({ error: "No URLs found for this user" });
//     }
//     const formattedUrls = urls.map((url) => ({
//       id: url.ShortId,
//       qrCode: url.qrCodeURL,
//       shortDescription: url.shortDescription,
//     }));
//     res.json(formattedUrls);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// });

// // // Route to get a single QR code for a specific user and shortID
// // router.get("/view/user/:userId/:ShortId", async (req, res) => {
// //   const { userId, ShortId } = req.params;
// //   try {
// //     // Retrieve the URL with the specific ShortId
// //     const entry = await URL.findOne({ userId, ShortId });

// //     // Check if the URL is found
// //     if (!entry) {
// //       return res.status(404).json({ error: "QR code not found" });
// //     }

// //     // Serve the HTML page for viewing a single QR code
// //     // You should pass the entry data to this page if needed
// //     res.sendFile(path.join(__dirname, "../public/view.html"));
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });
// // Route to get the QR code by ShortId
// router.get("/qr/:ShortId", async (req, res) => {
//   const { ShortId } = req.params;
//   try {
//     const entry = await URL.findOne({ ShortId });
//     if (!entry) {
//       return res.status(404).json({ error: "QR code not found" });
//     }

//     // Check if QR code has expired
//     const currentDate = new Date();
//     if (currentDate > entry.expiryDate) {
//       entry.isInactive = true;
//       await entry.save();
//     }

//     return res.json({
//       qrCode: entry.qrCodeURL,
//       activationDate: entry.activationDate.toISOString(),
//       expiryDate: entry.expiryDate.toISOString(),
//       isInactive: entry.isInactive,
//     });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// });

// // Route to activate the QR code by ShortId
// router.patch("/activate/:ShortId", async (req, res) => {
//   const { ShortId } = req.params;
//   try {
//     const entry = await URL.findOneAndUpdate(
//       { ShortId },
//       {
//         isInactive: false,
//         activationDate: new Date(),
//         expiryDate: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes from now
//       },
//       { new: true }
//     );
//     if (!entry) {
//       return res.status(404).json({ error: "QR code not found" });
//     }
//     res.json({
//       message: "QR code activated",
//       qrCode: entry.qrCodeURL,
//       activationDate: entry.activationDate.toISOString(),
//       expiryDate: entry.expiryDate.toISOString(),
//       isInactive: entry.isInactive,
//     });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// });

// // Route to serve the HTML page for viewing a single QR code
// router.get("/view/:ShortId", (req, res) => {
//   res.sendFile(path.join(__dirname, "../public/view.html"));
// });

// // Route to serve the HTML page for viewing all QR codes for a user
// router.get("/view/user/:userId", (req, res) => {
//   res.sendFile(path.join(__dirname, "../public/viewAll.html"));
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

//     res.json({
//       labels,
//       data,
//       activationDate: url.activationDate.toISOString(),
//       expiryDate: url.expiryDate.toISOString(),
//     });
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
//     const entry = await URL.findOne({ ShortId });

//     if (!entry) {
//       return res.status(404).send("URL not found");
//     }

//     if (entry.isInactive) {
//       return res.status(403).send("QR code is inactive");
//     }

//     entry.visitedHistroy.push({ timestamp: new Date() });
//     await entry.save();

//     res.redirect(entry.redirectURL);
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

// module.exports = router;

// // // routes/url.js
// const express = require("express");
// const { handleGenerateNewShortURL } = require("../controllers/url");
// const path = require("path");
// const URL = require("../models/url");
// const router = express.Router();

// // Route to handle generating new short URLs
// router.post("/", handleGenerateNewShortURL);

// // Route to get all URLs for a specific user
// router.get("/:userId", async (req, res) => {
//   const { userId } = req.params;
//   try {
//     const urls = await URL.find({ userId });
//     if (!urls || urls.length === 0) {
//       return res.status(404).json({ error: "No URLs found for this user" });
//     }
//     const formattedUrls = urls.map((url) => ({
//       id: url.ShortId,
//       qrCode: url.qrCodeURL,
//       shortDescription: url.shortDescription,
//     }));
//     res.json(formattedUrls);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// });

// // Route to get the QR code by ShortId
// router.get("/qr/:ShortId", async (req, res) => {
//   const { ShortId } = req.params;
//   try {
//     const entry = await URL.findOne({ ShortId });
//     if (!entry) {
//       return res.status(404).json({ error: "QR code not found" });
//     }

//     // Check if QR code has expired
//     const currentDate = new Date();
//     if (currentDate > entry.expiryDate) {
//       entry.isInactive = true;
//       await entry.save();
//     }

//     return res.json({
//       qrCode: entry.qrCodeURL,
//       activationDate: entry.activationDate.toISOString(),
//       expiryDate: entry.expiryDate.toISOString(),
//       isInactive: entry.isInactive,
//     });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// });

// // Route to activate the QR code by ShortId
// router.patch("/activate/:ShortId", async (req, res) => {
//   const { ShortId } = req.params;
//   try {
//     const entry = await URL.findOneAndUpdate(
//       { ShortId },
//       {
//         isInactive: false,
//         activationDate: new Date(),
//         expiryDate: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes from now
//       },
//       { new: true }
//     );
//     if (!entry) {
//       return res.status(404).json({ error: "QR code not found" });
//     }
//     res.json({
//       message: "QR code activated",
//       qrCode: entry.qrCodeURL,
//       activationDate: entry.activationDate.toISOString(),
//       expiryDate: entry.expiryDate.toISOString(),
//       isInactive: entry.isInactive,
//     });
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

//     res.json({
//       labels,
//       data,
//       activationDate: url.activationDate.toISOString(),
//       expiryDate: url.expiryDate.toISOString(),
//     });
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
//     const entry = await URL.findOne({ ShortId });

//     if (!entry) {
//       return res.status(404).send("URL not found");
//     }

//     if (entry.isInactive) {
//       return res.status(403).send("QR code is inactive");
//     }

//     entry.visitedHistroy.push({ timestamp: new Date() });
//     await entry.save();

//     res.redirect(entry.redirectURL);
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

// module.exports = router;

//Current Working
//routes/url.js
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

//     // Check if QR code has expired
//     const currentDate = new Date();
//     if (currentDate > entry.expiryDate) {
//       entry.isInactive = true;
//       await entry.save();
//     }

//     return res.json({
//       qrCode: entry.qrCodeURL,
//       activationDate: entry.activationDate.toISOString(),
//       expiryDate: entry.expiryDate.toISOString(),
//       isInactive: entry.isInactive,
//     });
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// });

// // Route to activate the QR code by ShortId
// router.patch("/activate/:ShortId", async (req, res) => {
//   const { ShortId } = req.params;
//   try {
//     const entry = await URL.findOneAndUpdate(
//       { ShortId },
//       {
//         isInactive: false,
//         activationDate: new Date(),
//         expiryDate: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes from now
//       },
//       { new: true }
//     );
//     if (!entry) {
//       return res.status(404).json({ error: "QR code not found" });
//     }
//     res.json({
//       message: "QR code activated",
//       qrCode: entry.qrCodeURL,
//       activationDate: entry.activationDate.toISOString(),
//       expiryDate: entry.expiryDate.toISOString(),
//       isInactive: entry.isInactive,
//     });
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

//     res.json({
//       labels,
//       data,
//       activationDate: url.activationDate.toISOString(),
//       expiryDate: url.expiryDate.toISOString(),
//     });
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
//     const entry = await URL.findOne({ ShortId });

//     if (!entry) {
//       return res.status(404).send("URL not found");
//     }

//     if (entry.isInactive) {
//       return res.status(403).send("QR code is inactive");
//     }

//     entry.visitedHistroy.push({ timestamp: new Date() });
//     await entry.save();

//     res.redirect(entry.redirectURL);
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

// module.exports = router;
