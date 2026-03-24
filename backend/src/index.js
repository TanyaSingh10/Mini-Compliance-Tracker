const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Mini Compliance Tracker API is running" });
});

app.get("/api/clients", (req, res) => {
  res.json([
    { id: 1, name: "Acme Corp" },
    { id: 2, name: "Beta Ltd" }
  ]);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});