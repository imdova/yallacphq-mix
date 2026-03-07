import { NestFactory } from '@nestjs/core';
import { Types } from 'mongoose';
import { AppModule } from './app.module';
import { CoursesService } from './modules/courses/courses.service';

function toNumber(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

async function main() {
  const courseId = process.argv[2] ?? '';
  const priceRegular = toNumber(process.argv[3]) ?? 399;
  const priceSale = toNumber(process.argv[4]);
  const currency = (process.argv[5] ?? 'USD').trim() || 'USD';

  if (!courseId || !Types.ObjectId.isValid(courseId)) {
    // eslint-disable-next-line no-console
    console.error('Usage: ts-node src/make-course-paid.ts <courseId> [priceRegular] [priceSale] [currency]');
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error'],
  });

  try {
    const courses = app.get(CoursesService);
    const updated = await courses.updateById(courseId, {
      priceRegular,
      ...(priceSale != null ? { priceSale } : {}),
      currency,
    });

    if (!updated) {
      // eslint-disable-next-line no-console
      console.error('Course not found:', courseId);
      process.exitCode = 2;
      return;
    }

    // eslint-disable-next-line no-console
    console.log('Updated course pricing:', {
      id: String(updated._id),
      title: updated.title,
      priceRegular: updated.priceRegular,
      priceSale: updated.priceSale,
      currency: updated.currency,
    });
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('make-course-paid failed:', err);
  process.exit(1);
});

