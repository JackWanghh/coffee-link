import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class StartPaymentDto {
  @ApiProperty({ enum: ['wechat', 'alipay'] })
  @IsIn(['wechat', 'alipay'])
  method: 'wechat' | 'alipay';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

export class PaymentCallbackDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  providerTradeNo: string;

  @ApiProperty({ enum: ['success', 'failed'] })
  @IsIn(['success', 'failed'])
  status: 'success' | 'failed';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  signature: string;
}
