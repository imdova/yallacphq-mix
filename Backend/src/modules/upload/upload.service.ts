import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { PutObjectCommandInput } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]);

const ALLOWED_PDF_TYPE = 'application/pdf';

const COURSE_IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5MB
const PROFILE_IMAGE_MAX_BYTES = 2 * 1024 * 1024; // 2MB
const BANK_TRANSFER_MAX_BYTES = 10 * 1024 * 1024; // 10MB

export type UploadType = 'course-image' | 'profile-image' | 'bank-transfer';

@Injectable()
export class UploadService {
  private s3: S3Client | null = null;
  private bucket: string | null = null;
  private region: string | null = null;

  constructor(private readonly config: ConfigService) {
    const region = this.config.get<string>('AWS_REGION');
    const accessKey = this.config.get<string>('AWS_ACCESS_KEY');
    const secretKey = this.config.get<string>('AWS_SECRET_KEY');
    const bucket = this.config.get<string>('AWS_BUCKET_NAME');
    if (region && accessKey && secretKey && bucket) {
      this.region = region;
      this.bucket = bucket;
      this.s3 = new S3Client({
        region,
        credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      });
    }
  }

  private ensureS3(): S3Client {
    if (!this.s3 || !this.bucket || !this.region) {
      throw new BadRequestException(
        'File upload is not configured. Set AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY, and AWS_BUCKET_NAME.',
      );
    }
    return this.s3;
  }

  private getExtension(mimetype: string): string {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'application/pdf': 'pdf',
    };
    return map[mimetype?.toLowerCase()] ?? 'jpg';
  }

  async upload(
    type: UploadType,
    file: { buffer: Buffer; mimetype: string; originalname?: string },
    userId?: string,
  ): Promise<{ url: string }> {
    const mimetype = (file.mimetype ?? '').toLowerCase();
    const isBankTransfer = type === 'bank-transfer';
    if (isBankTransfer) {
      if (!ALLOWED_IMAGE_TYPES.has(mimetype) && mimetype !== ALLOWED_PDF_TYPE) {
        throw new BadRequestException(
          'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, PDF.',
        );
      }
    } else if (!ALLOWED_IMAGE_TYPES.has(mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed: JPEG, PNG, GIF, WebP.',
      );
    }

    const maxBytes =
      type === 'course-image'
        ? COURSE_IMAGE_MAX_BYTES
        : type === 'profile-image'
          ? PROFILE_IMAGE_MAX_BYTES
          : BANK_TRANSFER_MAX_BYTES;
    if (file.buffer.length > maxBytes) {
      const maxMB = maxBytes / (1024 * 1024);
      throw new BadRequestException(
        `File too large. Maximum size: ${maxMB}MB.`,
      );
    }

    const ext = this.getExtension(mimetype);
    const uuid = randomUUID();
    let key: string;
    if (type === 'profile-image') {
      const uid = userId ?? uuid;
      key = `profile/${uid}/${uuid}.${ext}`;
    } else if (type === 'bank-transfer') {
      const uid = userId ?? uuid;
      key = `bank-transfers/${uid}/${uuid}.${ext}`;
    } else {
      key = `courses/${uuid}.${ext}`;
    }

    const s3 = this.ensureS3();
    const bucket = this.bucket!;
    const region = this.region!;

    const input: PutObjectCommandInput = {
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: mimetype,
      // Do not set ACL so upload works when bucket has "Block public access" enabled.
      // For public image URLs, add a bucket policy allowing s3:GetObject for the bucket (or prefix).
    };
    try {
      await s3.send(new PutObjectCommand(input));
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'S3 upload failed';
      throw new BadRequestException(`Upload failed: ${msg}`);
    }

    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    return { url };
  }
}