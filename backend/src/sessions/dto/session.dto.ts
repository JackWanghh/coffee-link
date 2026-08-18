import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateCoffeeInvitationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sharerId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  themeId: string;

  @ApiProperty({ example: '想了解转岗到大模型的经历' })
  @IsString()
  @Length(20, 300, { message: '问题长度需在 20～300 字之间' })
  question: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  slotIds: string[];
}

export class CreateTopicSwapInvitationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sharerId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  requestedThemeId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  offeredThemeId: string;

  @ApiProperty()
  @IsString()
  @Length(8, 300)
  question: string;

  @ApiProperty()
  @IsString()
  @Length(8, 300)
  offering: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  slotIds: string[];
}

export class AcceptInvitationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  confirmedSlotId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  receiverQuestion?: string;
}

export class DeclineInvitationDto {
  @ApiProperty({ enum: ['超出当前分享范围', '信息不足', '时间不合适', '近期暂停接受'] })
  @IsIn(['超出当前分享范围', '信息不足', '时间不合适', '近期暂停接受'])
  reason: string;
}

export class ResubmitSlotsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  slotIds: string[];
}

export class SessionListQuery {
  @IsOptional()
  @IsIn(['sent', 'incoming'])
  direction?: 'sent' | 'incoming';

  @IsOptional()
  @IsIn(['all', 'pending', 'payment', 'scheduled', 'completed'])
  filter?: 'all' | 'pending' | 'payment' | 'scheduled' | 'completed';

  @IsOptional()
  @IsString()
  afterId?: string;

  @IsOptional()
  limit?: number;
}
