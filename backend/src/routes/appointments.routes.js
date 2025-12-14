const { Router } = require("express");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const { authRequired } = require("../middleware/auth");

const prisma = new PrismaClient();
const router = Router();

const AppointmentCreateSchema = z.object({
  specialtyId: z.number().int().positive(),
  mode: z.enum(["PRESENCIAL", "VIRTUAL"]),
  scheduledAt: z.string().datetime(),
  reason: z.string().max(240).optional(),
});

router.post("/", authRequired, async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) return res.status(401).json({ error: "Sesión inválida" });
    if (role !== "PACIENTE") return res.status(403).json({ error: "Solo PACIENTE puede crear citas" });

    const raw = req.body || {};
    const normalized = {
      specialtyId: Number(raw.specialtyId),
      mode: raw.mode,
      scheduledAt: raw.scheduledAt,
      reason: raw.reason,
    };

    const parsed = AppointmentCreateSchema.safeParse(normalized);
    if (!parsed.success) return res.status(400).json({ error: "Datos de cita inválidos" });

    const { specialtyId, mode, scheduledAt, reason } = parsed.data;

    const spec = await prisma.specialty.findUnique({ where: { id: specialtyId } });
    if (!spec) return res.status(404).json({ error: "Especialidad no existe" });

    const dt = new Date(scheduledAt);
    if (Number.isNaN(dt.getTime())) return res.status(400).json({ error: "scheduledAt inválido" });
    if (dt.getTime() < Date.now() - 60 * 1000) return res.status(400).json({ error: "scheduledAt debe ser futuro" });

    const appt = await prisma.appointment.create({
      data: {
        patientId: userId,
        specialtyId,
        mode,
        scheduledAt: dt,
        reason: reason || null,
        status: "PENDIENTE",
      },
      include: { specialty: true },
    });

    return res.status(201).json(appt);
  } catch (e) {
    console.error("[appointments:create]", e);
    return res.status(500).json({ error: "No se pudo crear la cita" });
  }
});

router.get("/mine", authRequired, async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  if (!userId) return res.status(401).json({ error: "Sesión inválida" });
  if (role !== "PACIENTE") return res.status(403).json({ error: "Solo PACIENTE" });

  const items = await prisma.appointment.findMany({
    where: { patientId: userId },
    orderBy: { scheduledAt: "desc" },
    include: { specialty: true },
  });

  res.json(items);
});

router.get("/doctor", authRequired, async (req, res) => {
  const role = req.user?.role;
  if (role !== "MEDICO") return res.status(403).json({ error: "Solo MEDICO" });

  const items = await prisma.appointment.findMany({
    orderBy: { scheduledAt: "desc" },
    include: { specialty: true, patient: { select: { id: true, username: true } } },
  });

  res.json(items);
});

module.exports = router;
