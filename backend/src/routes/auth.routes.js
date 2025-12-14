const { Router } = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const { z } = require("zod");
const env = require("../config/env");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Intenta en 1 minuto." },
});

const LoginSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(6).max(72),
});

router.post("/login", loginLimiter, async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: "Datos inválidos" });

  const { username, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

  const token = jwt.sign(
    { username: user.username, role: user.role, sub: user.id },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN, algorithm: "HS256" }
  );

  return res.json({
    token,
    user: { id: user.id, username: user.username, role: user.role },
  });
});

module.exports = router;
