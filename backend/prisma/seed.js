const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.complianceTask.deleteMany();
  await prisma.client.deleteMany();

  const client1 = await prisma.client.create({
    data: {
      companyName: 'Acme Pvt Ltd',
      country: 'India',
      entityType: 'Private Limited',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      companyName: 'Global Tech LLC',
      country: 'USA',
      entityType: 'LLC',
    },
  });

  await prisma.complianceTask.createMany({
    data: [
      {
        clientId: client1.id,
        title: 'GST Filing',
        description: 'Monthly GST filing',
        category: 'Tax',
        dueDate: new Date('2026-03-20'),
        status: 'Pending',
        priority: 'High',
      },
      {
        clientId: client1.id,
        title: 'Annual ROC Filing',
        description: 'Submit annual ROC documents',
        category: 'Filing',
        dueDate: new Date('2026-04-10'),
        status: 'Pending',
        priority: 'Medium',
      },
      {
        clientId: client2.id,
        title: 'Sales Tax Return',
        description: 'Quarterly return submission',
        category: 'Tax',
        dueDate: new Date('2026-03-15'),
        status: 'Completed',
        priority: 'Low',
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });