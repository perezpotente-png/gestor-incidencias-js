require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// RUTAS
const authRoutes = require("./routes/auth");
const incidenciasRoutes = require("./routes/incidencias");

app.use("/api/auth", authRoutes);
app.use("/api/incidencias", incidenciasRoutes);

// TEST
app.get("/", (req, res) => {
  res.send("API funcionando");
});

// SERVER
app.listen(3000, () => {
  console.log("🔥 SERVIDOR ACTIVO 🔥");
  console.log("http://localhost:3000");
});