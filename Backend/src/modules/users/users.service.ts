import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role } from '../../common/auth/role';
import { User, UserDocument } from './schemas/user.schema';
import type { UpdateCurrentUserBody } from '../../contracts';

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async createStudent(params: {
    name: string;
    email: string;
    passwordHash: string;
    speciality?: string;
    emailVerified?: boolean;
    googleId?: string;
    profileImageUrl?: string;
  }) {
    return this.userModel.create({
      name: params.name,
      email: params.email,
      passwordHash: params.passwordHash,
      role: Role.student,
      emailVerified: params.emailVerified ?? false,
      ...(params.googleId ? { googleId: params.googleId } : {}),
      ...(params.profileImageUrl ? { profileImageUrl: params.profileImageUrl } : {}),
      ...(params.speciality != null && params.speciality.trim() !== '' && { speciality: params.speciality.trim() }),
    });
  }

  async createAdmin(params: {
    name: string;
    email: string;
    passwordHash: string;
  }) {
    return this.userModel.create({
      name: params.name,
      email: params.email,
      passwordHash: params.passwordHash,
      role: Role.admin,
    });
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email: email.trim().toLowerCase() }).exec();
  }

  async findByGoogleId(googleId: string) {
    return this.userModel.findOne({ googleId: googleId.trim() }).exec();
  }

  async findOne(filter: Partial<Pick<User, 'email' | 'role'>>) {
    return this.userModel.findOne(filter).exec();
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.userModel.findById(id).exec();
  }

  async list() {
    return this.userModel.find().sort({ createdAt: -1 }).exec();
  }

  /**
   * List users with optional search (name, email, phone) and filters (country, speciality, enrollment).
   */
  async listWithFilters(params: {
    search?: string;
    country?: string;
    speciality?: string;
    enrollment?: 'all' | 'enrolled' | 'not_enrolled';
  }) {
    const and: Record<string, unknown>[] = [];
    const search = params.search?.trim();
    if (search) {
      const re = new RegExp(escapeRegex(search), 'i');
      and.push({ $or: [{ name: re }, { email: re }, { phone: re }] });
    }
    if (params.country?.trim()) {
      and.push({
        country: { $regex: new RegExp(`^${escapeRegex(params.country.trim())}$`, 'i') },
      });
    }
    if (params.speciality?.trim()) {
      and.push({
        speciality: { $regex: new RegExp(`^${escapeRegex(params.speciality.trim())}$`, 'i') },
      });
    }
    if (params.enrollment === 'enrolled') {
      and.push({ enrolled: true });
    } else if (params.enrollment === 'not_enrolled') {
      and.push({ enrolled: { $ne: true } });
    }
    const query = and.length > 0 ? { $and: and } : {};
    return this.userModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async updateCurrentUser(userId: string, patch: UpdateCurrentUserBody) {
    if (!Types.ObjectId.isValid(userId)) return null;
    const update: Partial<User> = {};
    if (typeof patch.name === 'string') update.name = patch.name;
    if (typeof patch.phone === 'string') update.phone = patch.phone;
    if (typeof patch.course === 'string') update.course = patch.course;
    if (typeof patch.country === 'string') update.country = patch.country;
    if (typeof patch.speciality === 'string')
      update.speciality = patch.speciality;
    if (patch.profileImageUrl !== undefined)
      update.profileImageUrl = patch.profileImageUrl ?? undefined;

    return this.userModel
      .findByIdAndUpdate(userId, { $set: update }, { new: true })
      .exec();
  }

  async setEnrolled(userId: string, enrolled: boolean) {
    if (!Types.ObjectId.isValid(userId)) return null;
    return this.userModel
      .findByIdAndUpdate(userId, { $set: { enrolled } }, { new: true })
      .exec();
  }

  /** Add a course to the user's enrolled list (idempotent). Returns true if newly added. */
  async addEnrolledCourse(userId: string, courseId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(courseId))
      return false;
    const user = await this.userModel.findById(userId).exec();
    if (!user) return false;
    const ids = user.enrolledCourseIds ?? [];
    if (ids.some((id) => String(id) === String(courseId))) return false;
    await this.userModel
      .findByIdAndUpdate(userId, {
        $set: { enrolled: true },
        $addToSet: { enrolledCourseIds: courseId },
      })
      .exec();
    return true;
  }

  async getEnrolledCourseIds(userId: string): Promise<string[]> {
    if (!Types.ObjectId.isValid(userId)) return [];
    const user = await this.userModel.findById(userId).select('enrolledCourseIds').exec();
    if (!user?.enrolledCourseIds?.length) return [];
    return user.enrolledCourseIds.map((id) => String(id));
  }

  async createFromAdmin(params: {
    name: string;
    email: string;
    role: Role;
    passwordHash: string;
    phone?: string;
    course?: string;
    country?: string;
    speciality?: string;
    enrolled?: boolean;
  }) {
    return this.userModel.create({
      ...params,
    });
  }

  async updateById(userId: string, patch: Partial<User>) {
    if (!Types.ObjectId.isValid(userId)) return null;
    return this.userModel
      .findByIdAndUpdate(userId, { $set: patch }, { new: true })
      .exec();
  }

  async setEmailVerificationChallenge(
    userId: string,
    params: { tokenHash: string; otpHash: string; expiresAt: Date },
  ) {
    if (!Types.ObjectId.isValid(userId)) return null;
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: {
            emailVerificationTokenHash: params.tokenHash,
            emailVerificationOtpHash: params.otpHash,
            emailVerificationExpiresAt: params.expiresAt,
            emailVerified: false,
          },
        },
        { new: true },
      )
      .exec();
  }

  async findByEmailVerificationTokenHash(tokenHash: string) {
    return this.userModel
      .findOne({
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpiresAt: { $gt: new Date() },
      })
      .exec();
  }

  async findByEmailVerificationOtp(email: string, otpHash: string) {
    return this.userModel
      .findOne({
        email: email.trim().toLowerCase(),
        emailVerificationOtpHash: otpHash,
        emailVerificationExpiresAt: { $gt: new Date() },
      })
      .exec();
  }

  async markEmailVerified(userId: string) {
    if (!Types.ObjectId.isValid(userId)) return null;
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: { emailVerified: true },
          $unset: {
            emailVerificationTokenHash: 1,
            emailVerificationOtpHash: 1,
            emailVerificationExpiresAt: 1,
          },
        },
        { new: true },
      )
      .exec();
  }

  async setPasswordResetChallenge(
    userId: string,
    params: { tokenHash: string; otpHash: string; expiresAt: Date },
  ) {
    if (!Types.ObjectId.isValid(userId)) return null;
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: {
            passwordResetTokenHash: params.tokenHash,
            passwordResetOtpHash: params.otpHash,
            passwordResetExpiresAt: params.expiresAt,
          },
        },
        { new: true },
      )
      .exec();
  }

  async findByPasswordResetTokenHash(tokenHash: string) {
    return this.userModel
      .findOne({
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { $gt: new Date() },
      })
      .exec();
  }

  async findByPasswordResetOtp(email: string, otpHash: string) {
    return this.userModel
      .findOne({
        email: email.trim().toLowerCase(),
        passwordResetOtpHash: otpHash,
        passwordResetExpiresAt: { $gt: new Date() },
      })
      .exec();
  }

  async clearPasswordResetChallenge(userId: string) {
    if (!Types.ObjectId.isValid(userId)) return null;
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $unset: {
            passwordResetTokenHash: 1,
            passwordResetOtpHash: 1,
            passwordResetExpiresAt: 1,
          },
        },
        { new: true },
      )
      .exec();
  }

  async setPasswordHash(userId: string, passwordHash: string) {
    if (!Types.ObjectId.isValid(userId)) return null;
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          $set: { passwordHash },
          $unset: {
            passwordResetTokenHash: 1,
            passwordResetOtpHash: 1,
            passwordResetExpiresAt: 1,
          },
        },
        { new: true },
      )
      .exec();
  }

  async deleteById(userId: string) {
    if (!Types.ObjectId.isValid(userId)) return null;
    return this.userModel.findByIdAndDelete(userId).exec();
  }
}
