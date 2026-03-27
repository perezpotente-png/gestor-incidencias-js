const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 🔒 Comprobar token
  if (!authHeader) {
    return res.status(401).json({ msg: "No autorizado" });
  }

  // Formato: "Bearer TOKEN"
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Token inválido" });
  }

  try {
    // 🔐 Verificar token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Guardar usuario en request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ msg: "Token inválido o expirado" });
  }
};