import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import multer from 'multer';
import { ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiFileUpload } from '../../common/swagger/decorators/api-file-upload.decorator';
import { ApiAuth } from '../../common/swagger/decorators/api-auth.decorator';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { RequestUser } from '../../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/auth/roles.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { Role } from '../../common/auth/role';
import { UploadService } from './upload.service';

interface UploadResponse {
  url: string;
}

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly upload: UploadService) {}

  @Post('course-image')
  @Version('1')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.admin)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiAuth()
  @ApiConsumes('multipart/form-data')
  @ApiFileUpload({ fieldName: 'file', required: true })
  @ApiOperation({ summary: 'Upload course cover or instructor image (admin)' })
  @ApiOkResponse({ description: 'Returns the public URL of the uploaded image' })
  async uploadCourseImage(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<UploadResponse> {
    if (!file?.buffer) {
      throw new BadRequestException('No file provided. Send multipart/form-data with field "file".');
    }
    return this.upload.upload('course-image', {
      buffer: file.buffer,
      mimetype: file.mimetype ?? 'application/octet-stream',
      originalname: file.originalname,
    });
  }

  @Post('profile-image')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  @ApiAuth()
  @ApiConsumes('multipart/form-data')
  @ApiFileUpload({ fieldName: 'file', required: true })
  @ApiOperation({ summary: 'Upload profile/avatar image (authenticated user)' })
  @ApiOkResponse({ description: 'Returns the public URL of the uploaded image' })
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() user: RequestUser,
  ): Promise<UploadResponse> {
    if (!file?.buffer) {
      throw new BadRequestException('No file provided. Send multipart/form-data with field "file".');
    }
    return this.upload.upload(
      'profile-image',
      {
        buffer: file.buffer,
        mimetype: file.mimetype ?? 'application/octet-stream',
        originalname: file.originalname,
      },
      user.sub,
    );
  }
}
