import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class SubmitReviewDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty()
  @IsString()
  @Length(1, 500)
  comment: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tag?: string;
}

export class SubmitComplaintDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(1, 1000)
  description: string;
}

export class ResolveComplaintDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  approved: 'true' | 'false';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
