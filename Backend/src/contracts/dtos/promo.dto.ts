import { ApiProperty } from '@nestjs/swagger';

export enum PromoDiscountTypeDto {
  percentage = 'percentage',
  fixed = 'fixed',
}

export class ApiPromoCodeDto {
  @ApiProperty({ example: '65f3c77b0f6d1b5a3d1d9a10' })
  id!: string;

  @ApiProperty({ example: 'WELCOME10' })
  code!: string;

  @ApiProperty({
    enum: PromoDiscountTypeDto,
    example: PromoDiscountTypeDto.percentage,
  })
  discountType!: PromoDiscountTypeDto;

  @ApiProperty({ example: 10, minimum: 0 })
  discountValue!: number;

  @ApiProperty({ example: true })
  active!: boolean;

  @ApiProperty({ example: false })
  maxUsageEnabled!: boolean;

  @ApiProperty({ example: 100, nullable: true, required: false })
  maxUsage!: number | null;

  @ApiProperty({ example: false })
  perCustomerLimitEnabled!: boolean;

  @ApiProperty({ example: 1, nullable: true, required: false })
  perCustomerLimit!: number | null;

  @ApiProperty({ example: false })
  restrictToProductEnabled!: boolean;

  @ApiProperty({ example: null, nullable: true, required: false })
  productId!: string | null;

  @ApiProperty({ example: 0, minimum: 0 })
  usageCount!: number;
}

export class CreatePromoCodeBodyDto {
  @ApiProperty({ example: 'WELCOME10', minLength: 1 })
  code!: string;

  @ApiProperty({ enum: PromoDiscountTypeDto })
  discountType!: PromoDiscountTypeDto;

  @ApiProperty({ example: 10, minimum: 0 })
  discountValue!: number;
}

export class ListPromoCodesResponseDto {
  @ApiProperty({ type: [ApiPromoCodeDto] })
  items!: ApiPromoCodeDto[];
}

export class PromoCodeResponseDto {
  @ApiProperty({ type: ApiPromoCodeDto })
  promo!: ApiPromoCodeDto;
}
