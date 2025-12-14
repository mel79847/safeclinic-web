const { Router } = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = Router();

router.get("/", async (req, res) => {
  const list = await prisma.specialty.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true }
  });
  res.json(list);
});

module.exports = router;
