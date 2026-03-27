const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

// Simulación de base de datos
let incidencias = [
  {
    id: 1,
    titulo: "Error login",
    descripcion: "No funciona",
    estado: "pendiente",
    usuario: "anonimo"
  }
];

// =========================
// 🔐 CREAR INCIDENCIA (PROTEGIDO)
// =========================
router.post("/", authMiddleware, (req, res) => {
  const { titulo, descripcion } = req.body;

  // Validación básica
  if (!titulo || titulo.length < 3) {
    return res.status(400).json({ error: "Título inválido" });
  }

  if (!descripcion || descripcion.length < 3) {
    return res.status(400).json({ error: "Descripción inválida" });
  }

  const nueva = {
    id: Date.now(),
    titulo,
    descripcion,
    estado: "pendiente",
    usuario: req.user.usuario // 🔥 usuario real del token
  };

  incidencias.push(nueva);

  res.json(nueva);
});

// =========================
// 🟢 VER PUBLICO (OPCIONAL)
// =========================
router.get("/public", (req, res) => {
  res.json(incidencias);
});

// =========================
// 🔐 VER PRIVADO (LOGUEADO)
// =========================
router.get("/", authMiddleware, (req, res) => {
  res.json(incidencias);
});

// =========================
// 🔐 CAMBIAR ESTADO
// =========================
router.put("/:id", authMiddleware, (req, res) => {
  const { estado } = req.body;

  if (!["pendiente", "proceso", "resuelta"].includes(estado)) {
    return res.status(400).json({ error: "Estado inválido" });
  }

  incidencias = incidencias.map(i =>
    i.id == req.params.id ? { ...i, estado } : i
  );

  res.json({ ok: true });
});

// =========================
// 🔥 BORRAR (SOLO ADMIN)
// =========================
router.delete("/:id", authMiddleware, (req, res) => {

  if (!req.user || req.user.rol !== "admin") {
    return res.status(403).json({ msg: "Solo admin puede eliminar" });
  }

  incidencias = incidencias.filter(i => i.id != req.params.id);

  res.json({ ok: true });
});

module.exports = router;