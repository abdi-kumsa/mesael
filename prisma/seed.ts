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

  const awashProject = await prisma.project.upsert({
    where: { code: 'PRJ-AWASH' },
    update: {},
    create: {
      code: 'PRJ-AWASH',
      name: 'Awash Bridge Construction',
      client: 'Federal Roads Authority',
    },
  });

  const hawassaProject = await prisma.project.upsert({
    where: { code: 'PRJ-HAWASSA' },
    update: {},
    create: {
      code: 'PRJ-HAWASSA',
      name: 'Hawassa Industrial Park',
      client: 'IPDC',
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

  const cc5001 = await prisma.costCode.upsert({
    where: { code: 'CC-5001' },
    update: {},
    create: {
      code: 'CC-5001',
      name: 'Concrete Works',
      projectId: awashProject.id,
      budget: 12000000,
      committed: 500000,
    },
  });

  const cc6001 = await prisma.costCode.upsert({
    where: { code: 'CC-6001' },
    update: {},
    create: {
      code: 'CC-6001',
      name: 'Structural Steel',
      projectId: hawassaProject.id,
      budget: 25000000,
      committed: 1000000,
    },
  });

  // 4. Create Suppliers
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

  const supplier2 = await prisma.supplier.upsert({
    where: { tin: '0098765432' },
    update: {},
    create: {
      legalName: 'Ethio Steel Trading PLC',
      tin: '0098765432',
      vatStatus: 'REGISTERED',
      bankDetails: JSON.stringify({ bank: 'Awash', account: '1000987654321' }),
      status: 'APPROVED'
    }
  });

  // 5. Create Purchase Requisition & Purchase Order
  const pr1 = await prisma.purchaseRequisition.upsert({
    where: { code: 'PR-2026-0001' },
    update: {},
    create: {
      code: 'PR-2026-0001',
      description: 'Reinforcement steel bars 16mm',
      status: 'ORDERED',
      projectId: boleProject.id,
      costCodeId: cc2201.id,
      preparedById: firehiwot.id,
      items: {
        create: [
          { description: 'Steel Bar 16mm', quantity: 500, unit: 'kg' },
          { description: 'Binding Wire', quantity: 50, unit: 'rolls' },
        ],
      },
    }
  });

  const po1 = await prisma.purchaseOrder.upsert({
    where: { code: 'PO-2026-0001' },
    update: {},
    create: {
      code: 'PO-2026-0001',
      status: 'ISSUED',
      requisitionId: pr1.id,
      supplierId: supplier2.id,
      preparedById: samuel.id,
      items: {
        create: [
          { description: 'Steel Bar 16mm', quantity: 500, unitPrice: 95, unit: 'kg' },
          { description: 'Binding Wire', quantity: 50, unitPrice: 120, unit: 'rolls' },
        ],
      },
    }
  });

  // 6. Create Subcontract (SOP - Schedule of Prices / Subcontract)
  const sub1 = await prisma.subcontract.upsert({
    where: { code: 'SUB-2026-0001' },
    update: {},
    create: {
      code: 'SUB-2026-0001',
      status: 'ACTIVE',
      vendorId: supplier1.id,
      projectId: awashProject.id,
      costCodeId: cc5001.id,
      preparedById: firehiwot.id,
      contractValue: 5000000,
      advancePercent: 20,
      retentionPercent: 5,
      advancePaid: 1000000,
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
