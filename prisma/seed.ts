import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  const adminUser = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "ADMIN", 
      admin: {
        create: {}
      }
    }
  });

  console.log("Admin created:", adminUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
