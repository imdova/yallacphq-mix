import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role } from '../../common/auth/role';
import { User, UserDocument } from './schemas/user.schema';
import type { UpdateCurrentUserBody } from '../../contracts';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async createStudent(params: {
    name: string;
    email: string;
    passwordHash: string;
  }) {
    return this.userModel.create({
      name: params.name,
      email: params.email,
      passwordHash: params.passwordHash,
      role: Role.student,
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

  async updateCurrentUser(userId: string, patch: UpdateCurrentUserBody) {
    if (!Types.ObjectId.isValid(userId)) return null;
    const update: Partial<User> = {};
    if (typeof patch.name === 'string') update.name = patch.name;
    if (typeof patch.phone === 'string') update.phone = patch.phone;
    if (typeof patch.course === 'string') update.course = patch.course;
    if (typeof patch.country === 'string') update.country = patch.country;
    if (typeof patch.speciality === 'string')
      update.speciality = patch.speciality;

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

  async deleteById(userId: string) {
    if (!Types.ObjectId.isValid(userId)) return null;
    return this.userModel.findByIdAndDelete(userId).exec();
  }
}
