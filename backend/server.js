// server.js
const express = require("express");
const app = express();

// JSON parser
app.use(express.json());

// Basit endpoint
app.get("/", (req, res) => {
  res.send("Hello World! 🚀");
});

// Sunucu başlat
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
