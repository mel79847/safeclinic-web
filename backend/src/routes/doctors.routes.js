const { Router } = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = Router();

router.get("/", async (req, res) => {
  const doctors = await prisma.user.findMany({
    where: { role: "MEDICO" },
    orderBy: { username: "asc" },
    select: { id: true, username: true, role: true }
  });

  res.json(doctors);
});

module.exports = router;
