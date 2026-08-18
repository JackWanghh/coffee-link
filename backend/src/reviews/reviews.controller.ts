import {
  Body,
  Controller,
  Headers,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { AppError } from '../common/errors';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ResolveComplaintDto, SubmitComplaintDto, SubmitReviewDto } from './dto/review.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('sessions/:id/review')
  async review(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: SubmitReviewDto) {
    return { data: await this.reviews.submitReview(id, user.id, dto) };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('sessions/:id/complaint')
  async complaint(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: SubmitComplaintDto) {
    return { data: await this.reviews.submitComplaint(id, user.id, dto) };
  }

  @Post('admin/complaints/:id/resolve')
  async resolve(
    @Param('id') id: string,
    @Body() dto: ResolveComplaintDto,
    @Headers('x-admin-token') token: string,
  ) {
    if (token !== (process.env.ADMIN_TOKEN ?? 'dev-admin')) {
      throw new AppError(403, 'AUTH_UNAUTHORIZED', '无管理员权限');
    }
    return { data: await this.reviews.resolveComplaint(id, dto) };
  }
}
