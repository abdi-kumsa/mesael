import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding initial enterprise data...');

  // Hash common passwords
  const universalPassword = await bcrypt.hash('1234', 10);
  const passwordOwner = universalPassword;
  const passwordDgm = universalPassword;
  const passwordFinance = universalPassword;
  const passwordAccountant = universalPassword;
  const passwordTax = universalPassword;

  // 1. Create Users
  const mesael = await prisma.user.upsert({
    where: { email: 'mesael@mesael.et' },
    update: { password: passwordOwner },
    create: {
      email: 'mesael@mesael.et',
      name: 'Mesael',
      roleId: 'mesael',
      title: 'Owner / CEO',
      avatar: 'MS',
      password: passwordOwner,
    },
  });

  const dembi = await prisma.user.upsert({
    where: { email: 'dembi@mesael.et' },
    update: { password: passwordDgm },
    create: {
      email: 'dembi@mesael.et',
      name: 'Dembi',
      roleId: 'dembi',
      title: 'Deputy GM',
      avatar: 'DG',
      password: passwordDgm,
    },
  });

  const leta = await prisma.user.upsert({
    where: { email: 'leta@mesael.et' },
    update: { password: passwordFinance },
    create: {
      email: 'leta@mesael.et',
      name: 'Leta',
      roleId: 'leta',
      title: 'Operational Finance',
      avatar: 'LG',
      password: passwordFinance,
    },
  });

  const kalkidan = await prisma.user.upsert({
    where: { email: 'kalkidan@mesael.et' },
    update: { password: passwordAccountant },
    create: {
      email: 'kalkidan@mesael.et',
      name: 'Kalkidan',
      roleId: 'kalkidan',
      title: 'Accountant',
      avatar: 'KA',
      password: passwordAccountant,
    },
  });

  const yamrot = await prisma.user.upsert({
    where: { email: 'yamrot@mesael.et' },
    update: { password: passwordTax },
    create: {
      email: 'yamrot@mesael.et',
      name: 'Yamrot Tufa',
      roleId: 'yamrot',
      title: 'Billing & Tax Compliance',
      avatar: 'YB',
      password: passwordTax,
    },
  });

  const firehiwot = await prisma.user.upsert({
    where: { email: 'firehiwot@mesael.et' },
    update: { password: universalPassword },
    create: {
      email: 'firehiwot@mesael.et',
      name: 'Firehiwot',
      roleId: 'firehiwot',
      title: 'Office Engineer',
      avatar: 'FH',
      password: universalPassword,
    },
  });

  const samuel = await prisma.user.upsert({
    where: { email: 'samuel@mesael.et' },
    update: { password: universalPassword },
    create: {
      email: 'samuel@mesael.et',
      name: 'Samuel',
      roleId: 'samuel',
      title: 'Purchaser',
      avatar: 'SM',
      password: universalPassword,
    },
  });

  const john = await prisma.user.upsert({
    where: { email: 'john@mesael.et' },
    update: { password: universalPassword },
    create: {
      email: 'john@mesael.et',
      name: 'John',
      roleId: 'john',
      title: 'Site Engineer',
      avatar: 'JH',
      password: universalPassword,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@mesael.et' },
    update: { password: universalPassword },
    create: {
      email: 'admin@mesael.et',
      name: 'System Admin',
      roleId: 'admin',
      title: 'IT Administrator',
      avatar: 'IT',
      password: universalPassword,
    },
  });

  // 2. Create Projects
  const boleProject = await prisma.project.upsert({
    where: { code: 'PRJ-BOLE' },
    update: {},
    create: {
      code: 'PRJ-BOLE',
      name: 'Bole Ring Road Extension',
      client: 'City Admin',
    },
  });

  const cmcProject = await prisma.project.upsert({
    where: { code: 'PRJ-CMC' },
    update: {},
    create: {
      code: 'PRJ-CMC',
      name: 'CMC Residential Superstructure',
      client: 'Private Developer',
    },
  });

  // 3. Create Cost Codes (WBS)
  const cc2201 = await prisma.costCode.upsert({
    where: { code: 'CC-2201' },
    update: {},
    create: {
      code: 'CC-2201',
      name: 'Reinforcement Steel',
      projectId: boleProject.id,
      budget: 8500000,
      committed: 1250000,
    },
  });

  const cc4102 = await prisma.costCode.upsert({
    where: { code: 'CC-4102' },
    update: {},
    create: {
      code: 'CC-4102',
      name: 'Excavation & Earthworks',
      projectId: boleProject.id,
      budget: 4200000,
      committed: 800000,
    },
  });
  // 4. Create Supplier
  const supplier1 = await prisma.supplier.upsert({
    where: { tin: '0012938475' },
    update: {},
    create: {
      legalName: 'Abyssinia Steel PLC',
      tin: '0012938475',
      vatStatus: 'REGISTERED',
      bankDetails: JSON.stringify({ bank: 'CBE', account: '1000123456789' }),
      status: 'APPROVED'
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
