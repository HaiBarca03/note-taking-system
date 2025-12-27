// src/auth/dto/auth.input.ts
import { InputType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

@InputType() // Decorator cho GraphQL
export class AuthInput {
  @Field()
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @Field()
  @ApiProperty({ example: 'password123', minLength: 6 })
  @MinLength(6, { message: 'Mật khẩu phải ít nhất 6 ký tự' })
  password: string;
}

@InputType()
export class RegisterInput extends AuthInput {
  @Field({ nullable: true })
  @ApiProperty({ required: false })
  fullName?: string;
}
