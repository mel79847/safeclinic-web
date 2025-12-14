const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const env = require("./config/env");

const authRoutes = require("./routes/auth.routes");
const specialtiesRoutes = require("./routes/specialties.routes");
const doctorsRoutes = require("./routes/doctors.routes");
const appointmentsRoutes = require("./routes/appointments.routes");

const app = express();

app.set("trust proxy", 1);

app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false, 
  })
);

app.use(express.json({ limit: "200kb" }));
app.use(express.urlencoded({ extended: false, limit: "200kb" }));

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

app.use(
  "/api/",
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Demasiadas solicitudes. Intenta en 1 minuto." },
  })
);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "SafeClinic API", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/specialties", specialtiesRoutes);
app.use("/api/doctors", doctorsRoutes);
app.use("/api/appointments", appointmentsRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
  console.error("[api-error]", err);
  res.status(500).json({ error: "Error interno" });
});

module.exports = app;
