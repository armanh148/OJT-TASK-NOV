import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
  });
  console.log('CURRENT USERS:', JSON.stringify(users, null, 2));

  // Create or update admin user with username: admin, password: admin00
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin00', salt);

  // Check if admin user exists with email 'admin' or 'admin@budgettracker.com' or 'admin@ecotexinc.com'
  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'admin' },
        { email: 'admin@budgettracker.com' },
        { email: 'admin@ecotexinc.com' },
        { name: 'admin' },
      ],
    },
  });

  if (existingAdmin) {
    const updated = await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        name: 'admin',
        password_hash: passwordHash,
      },
    });
    console.log('UPDATED ADMIN USER:', updated);
  } else {
    const created = await prisma.user.create({
      data: {
        name: 'admin',
        email: 'admin',
        password_hash: passwordHash,
      },
    });
    console.log('CREATED ADMIN USER:', created);
  }

  // Also create/update admin@ecotexinc.com and admin@budgettracker.com just in case the user types either!
  const emails = ['admin@ecotexinc.com', 'admin@budgettracker.com'];
  for (const email of emails) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { name: 'admin', password_hash: passwordHash },
      });
      console.log(`Updated password for ${email}`);
    } else {
      await prisma.user.create({
        data: { name: 'admin', email, password_hash: passwordHash },
      });
      console.log(`Created user for ${email}`);
    }
  }

  console.log('DONE!');
}

main()
  .catch((e) => {
    console.error('ERROR:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
