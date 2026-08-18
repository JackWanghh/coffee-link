import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  company: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  declarationNote?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[];
}

export class ThemeItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(120)
  durationMinutes?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludes?: string[];
}

export class UpdateThemesDto {
  @ApiProperty({ type: [ThemeItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => ThemeItemDto)
  themes: ThemeItemDto[];
}

export class SetSignatureDrinkDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  drinkId: string;
}

export class UpdateTopicSwapSettingsDto {
  @ApiProperty()
  @IsBoolean()
  accepts: boolean;

  @ApiProperty({ enum: [1, 2, 3, 5] })
  @IsIn([1, 2, 3, 5])
  weeklyLimit: number;
}

export class SlotItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  slotAt: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class UpdateSlotsDto {
  @ApiProperty({ type: [SlotItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique((s: SlotItemDto) => s.label)
  @ValidateNested({ each: true })
  @Type(() => SlotItemDto)
  slots: SlotItemDto[];
}

export class UpdateMeetingLinkDto {
  @ApiProperty({ example: 'https://meeting.tencent.com/dm/AbCdEf123' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^https:\/\/meeting\.tencent\.com\/.+/, {
    message: '请输入有效的腾讯会议链接',
  })
  meetingLink: string;
}

export class UpdateSharingDto {
  @ApiProperty()
  @IsBoolean()
  open: boolean;
}

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  appearanceThemeId?: string;

  @IsOptional()
  @IsBoolean()
  autoCalendarSync?: boolean;

  @IsOptional()
  @IsBoolean()
  defaultMeetingReady?: boolean;

  @IsOptional()
  @IsBoolean()
  hapticsEnabled?: boolean;
}
