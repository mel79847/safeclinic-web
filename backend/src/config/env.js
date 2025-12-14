require("dotenv").config();

function reqEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Falta variable de entorno: ${name}`);
  return v;
}

module.exports = {
  PORT: Number(process.env.API_PORT || 3000),
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:8080",
  JWT_SECRET: reqEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "2h",
  DATABASE_URL: reqEnv("DATABASE_URL"),
};
