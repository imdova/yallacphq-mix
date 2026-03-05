import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
  ) {}

  async getCart(userId: string): Promise<string[]> {
    const cart = await this.cartModel.findOne({ userId }).exec();
    return cart?.courseIds ?? [];
  }

  async addItem(userId: string, courseId: string): Promise<string[]> {
    if (!Types.ObjectId.isValid(courseId)) return this.getCart(userId);
    let cart = await this.cartModel.findOne({ userId }).exec();
    if (!cart) {
      cart = await this.cartModel.create({ userId, courseIds: [courseId] });
      return cart.courseIds;
    }
    if (cart.courseIds.includes(courseId)) return cart.courseIds;
    cart.courseIds.push(courseId);
    await cart.save();
    return cart.courseIds;
  }

  async removeItem(userId: string, courseId: string): Promise<string[]> {
    const cart = await this.cartModel.findOne({ userId }).exec();
    if (!cart) return [];
    cart.courseIds = cart.courseIds.filter((id) => id !== courseId);
    await cart.save();
    return cart.courseIds;
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartModel.findOneAndUpdate(
      { userId },
      { $set: { courseIds: [] } },
    ).exec();
  }
}
