import { ApiProperty } from '@nestjs/swagger';

export enum UserRoleDto {
  admin = 'admin',
  student = 'student',
}

export class ApiUserDto {
  @ApiProperty({ example: '65f3c77b0f6d1b5a3d1d9a10' })
  id!: string;

  @ApiProperty({ example: 'student@example.com', format: 'email' })
  email!: string;

  @ApiProperty({ required: false, example: false })
  emailVerified?: boolean;

  @ApiProperty({ example: 'Jane Student' })
  name!: string;

  @ApiProperty({ enum: UserRoleDto, example: UserRoleDto.student })
  role!: UserRoleDto;

  @ApiProperty({ required: false, example: false })
  enrolled?: boolean;

  @ApiProperty({ required: false, example: '+45 12 34 56 78' })
  phone?: string;

  @ApiProperty({ required: false, example: 'CPHQ Prep' })
  course?: string;

  @ApiProperty({ required: false, example: 'Denmark' })
  country?: string;

  @ApiProperty({ required: false, example: 'Quality Improvement' })
  speciality?: string;

  @ApiProperty({ example: '2026-03-03T12:34:56.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-03-03T12:34:56.000Z' })
  updatedAt!: string;
}

export class CurrentUserResponseDto {
  @ApiProperty({ type: ApiUserDto })
  user!: ApiUserDto;
}

export class ListUsersResponseDto {
  @ApiProperty({ type: [ApiUserDto] })
  items!: ApiUserDto[];
}

export class CreateUserBodyDto {
  @ApiProperty({ example: 'student@example.com', format: 'email' })
  email!: string;

  @ApiProperty({ example: 'Jane Student', minLength: 1 })
  name!: string;

  @ApiProperty({ enum: UserRoleDto, example: UserRoleDto.student })
  role!: UserRoleDto;

  @ApiProperty({ required: false, example: '+45 12 34 56 78' })
  phone?: string;

  @ApiProperty({ required: false, example: 'CPHQ Prep' })
  course?: string;

  @ApiProperty({ required: false, example: 'Denmark' })
  country?: string;

  @ApiProperty({ required: false, example: 'Quality Improvement' })
  speciality?: string;

  @ApiProperty({ required: false, example: false })
  enrolled?: boolean;
}

/** PATCH body: all fields optional */
export class AdminUpdateUserBodyDto {
  @ApiProperty({ required: false, example: 'Henry Walker', minLength: 1 })
  name?: string;

  @ApiProperty({ required: false, example: 'student18@example.com', format: 'email' })
  email?: string;

  @ApiProperty({ required: false, enum: UserRoleDto, example: UserRoleDto.student })
  role?: UserRoleDto;

  @ApiProperty({ required: false, example: '+20 155 014 8448' })
  phone?: string;

  @ApiProperty({ required: false, example: 'CPHQ Exam Prep' })
  course?: string;

  @ApiProperty({ required: false, example: 'Egypt' })
  country?: string;

  @ApiProperty({ required: false, example: 'Quality Management' })
  speciality?: string;

  @ApiProperty({ required: false, example: false })
  enrolled?: boolean;
}
