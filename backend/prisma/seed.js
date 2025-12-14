const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const specialties = [
    "Medicina General",
    "Cardiología",
    "Dermatología",
    "Psicología",
    "Pediatría",
  ];

  for (const name of specialties) {
    await prisma.specialty.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const mkHash = (plain) => bcrypt.hashSync(plain, 10);

  await prisma.user.upsert({
    where: { username: "medico1" },
    update: {
      passwordHash: mkHash("safe1234"),
      role: "MEDICO",
    },
    create: {
      username: "medico1",
      passwordHash: mkHash("safe1234"),
      role: "MEDICO",
    },
  });

  await prisma.user.upsert({
    where: { username: "paciente1" },
    update: {
      passwordHash: mkHash("safe1234"),
      role: "PACIENTE",
    },
    create: {
      username: "paciente1",
      passwordHash: mkHash("safe1234"),
      role: "PACIENTE",
    },
  });

  console.log("Seed listo: specialties + medico1 + paciente1 (con passwordHash)");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
