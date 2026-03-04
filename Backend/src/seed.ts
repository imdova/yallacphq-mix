import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcryptjs';
import { AppModule } from './app.module';
import { UsersService } from './modules/users/users.service';
import { Role } from './common/auth/role';

const DEFAULT_ADMIN_EMAIL = 'admin@example.com';
const DEFAULT_ADMIN_PASSWORD = 'Admin123!';
const DEFAULT_ADMIN_NAME = 'Admin';

async function seed() {
  const email =
    process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL;
  const plainPassword =
    process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? DEFAULT_ADMIN_NAME;

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error'],
  });

  const usersService = app.get(UsersService);

  const existing = await usersService.findOne({ email });
  if (existing) {
    if (existing.role === Role.admin) {
      console.log(`Admin already exists: ${email}`);
    } else {
      console.log(`User ${email} exists but is not an admin. Skipping seed.`);
    }
    await app.close();
    return;
  }

  const passwordHash = await bcrypt.hash(plainPassword, 10);
  await usersService.createAdmin({ name, email, passwordHash });
  console.log(`Admin account created: ${email}`);
  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
