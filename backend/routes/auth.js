const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ⚠️ Generamos el hash automáticamente al iniciar
let usuarioDB = {
  id: 1,
  usuario: "Sergiito24",
  password: "",
  rol: "admin"
};

// Generar hash al arrancar
(async () => {
  usuarioDB.password = await bcrypt.hash("1234", 10);
  console.log("HASH GENERADO:", usuarioDB.password);
})();

// LOGIN
router.post("/login", async (req, res) => {
  const { usuario, password } = req.body;

  try {
    console.log("Usuario recibido:", usuario);
    console.log("Password recibida:", password);

    if (usuario !== usuarioDB.usuario) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const coincide = await bcrypt.compare(password, usuarioDB.password);

    console.log("Coincide:", coincide);

    if (!coincide) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      {
        id: usuarioDB.id,
        usuario: usuarioDB.usuario,
        rol: usuarioDB.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        usuario: usuarioDB.usuario,
        rol: usuarioDB.rol
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno" });
  }
});

module.exports = router;