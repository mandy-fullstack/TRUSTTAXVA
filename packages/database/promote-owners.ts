import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const emails = ["applex.mandy@gmail.com", "loveforever.mandyanita@gmail.com"];

  console.log("Promoting accounts to ADMIN...");

  for (const email of emails) {
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email.toLowerCase(),
          mode: "insensitive",
        },
      },
    });

    if (!user) {
      console.log(`❌ No user found with email: ${email}`);
      continue;
    }

    if (user.role === "ADMIN") {
      console.log(`ℹ️ User ${user.email} is already ADMIN.`);
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      });
      console.log(`✅ Promoted user ${user.email} to ADMIN.`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
