import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcryptjs';
import { AppModule } from './app.module';
import { UsersService } from './modules/users/users.service';

const SEED_COUNT = 20;
const DEFAULT_PASSWORD = 'Student123!';

const NAMES = [
  'Emma Wilson',
  'Liam Johnson',
  'Olivia Brown',
  'Noah Davis',
  'Ava Martinez',
  'Ethan Anderson',
  'Sophia Taylor',
  'Mason Thomas',
  'Isabella Jackson',
  'William White',
  'Mia Harris',
  'James Martin',
  'Charlotte Garcia',
  'Benjamin Robinson',
  'Amelia Clark',
  'Lucas Lewis',
  'Harper Lee',
  'Henry Walker',
  'Evelyn Hall',
  'Alexander Young',
];

async function seedStudents() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error'],
  });

  const usersService = app.get(UsersService);
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  let created = 0;
  let skipped = 0;

  for (let i = 1; i <= SEED_COUNT; i++) {
    const email = `student${i}@example.com`;
    const name = NAMES[i - 1] ?? `Student ${i}`;

    const existing = await usersService.findOne({ email });
    if (existing) {
      skipped++;
      continue;
    }

    await usersService.createStudent({ name, email, passwordHash });
    created++;
    console.log(`Created student ${i}/${SEED_COUNT}: ${email}`);
  }

  console.log(`Done. Created ${created} students, skipped ${skipped} (already exist).`);
  console.log(`Default password for all: ${DEFAULT_PASSWORD}`);
  await app.close();
}

seedStudents().catch((err) => {
  console.error('Seed students failed:', err);
  process.exit(1);
});
