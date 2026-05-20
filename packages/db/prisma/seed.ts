import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// SA-flavored seed data. Pulled from packages/sa-content where canon, hand-curated here.
const TERRITORIES = [
  { name: 'Hillbrow', province: 'GP', area: 'hillbrow' },
  { name: 'Yeoville', province: 'GP', area: 'yeoville' },
  { name: 'Alexandra', province: 'GP', area: 'alexandra' },
  { name: 'Soweto - Diepkloof', province: 'GP', area: 'diepkloof' },
  { name: 'Soweto - Orlando East', province: 'GP', area: 'orlando_east' },
  { name: 'Sandton CBD', province: 'GP', area: 'sandton' },
  { name: 'Mamelodi East', province: 'GP', area: 'mamelodi' },
  { name: 'Khayelitsha', province: 'WC', area: 'khayelitsha' },
  { name: 'Mitchells Plain', province: 'WC', area: 'mitchells_plain' },
  { name: 'Umlazi', province: 'KZN', area: 'umlazi' },
  { name: 'Chatsworth', province: 'KZN', area: 'chatsworth' },
];

const BUSINESS_KINDS = [
  { kind: 'shisa_nyama', name: 'Bra Tshepo Shisa Nyama' },
  { kind: 'tavern', name: 'Skomplaas Tavern' },
  { kind: 'taxi_assoc', name: 'Top Six Taxi Association' },
  { kind: 'security', name: 'Iron Eagle Security Services' },
  { kind: 'logistics', name: 'Tshwane Quick Logistics' },
  { kind: 'construction', name: 'Sibanye Build Solutions' },
];

async function main() {
  console.log('Seeding territories...');
  for (const t of TERRITORIES) {
    await prisma.territory.upsert({
      where: { id: t.area },
      update: {},
      create: { id: t.area, ...t, control: 0 },
    });
  }

  console.log('Seeding businesses...');
  for (const b of BUSINESS_KINDS) {
    await prisma.business.create({
      data: {
        name: b.name,
        kind: b.kind,
        province: 'GP',
        area: 'hillbrow',
      },
    });
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
