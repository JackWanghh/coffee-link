import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class SendSmsDto {
  @ApiProperty({ example: '13800138000' })
  @IsPhoneNumber('CN', { message: '请输入有效的中国大陆手机号' })
  phone: string;

  @ApiProperty({ enum: ['register', 'reset'], example: 'register' })
  @IsIn(['register', 'reset'])
  purpose: 'register' | 'reset';
}

export class RegisterDto {
  @ApiProperty({ example: '13800138000' })
  @IsPhoneNumber('CN', { message: '请输入有效的中国大陆手机号' })
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6, { message: '验证码为 6 位数字' })
  code: string;

  @ApiProperty({ example: 'Pass123456' })
  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[\s\S]{8,20}$/, {
    message: '密码需 8～20 位且同时包含字母和数字',
  })
  password: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  agreed: boolean;
}

export class LoginDto {
  @ApiProperty({ example: '13800138000' })
  @IsPhoneNumber('CN', { message: '请输入有效的中国大陆手机号' })
  phone: string;

  @ApiProperty({ example: 'Pass123456' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: '13800138000' })
  @IsPhoneNumber('CN', { message: '请输入有效的中国大陆手机号' })
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6, { message: '验证码为 6 位数字' })
  code: string;

  @ApiProperty({ example: 'NewPass123' })
  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[\s\S]{8,20}$/, {
    message: '密码需 8～20 位且同时包含字母和数字',
  })
  newPassword: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
