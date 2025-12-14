const jwt = require("jsonwebtoken");
const env = require("../config/env");

function authRequired(req, res, next) {
  const h = req.headers.authorization || "";
  const [type, token] = h.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "Authorization requerido" });
  }

  try {
    const p = jwt.verify(token, env.JWT_SECRET);
    req.user = { id: Number(p.sub), role: p.role, username: p.username };
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

module.exports = { authRequired };
