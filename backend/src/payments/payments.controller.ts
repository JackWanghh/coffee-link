import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PaymentCallbackDto, StartPaymentDto } from './dto/payment.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller()
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('sessions/:id/payments')
  async start(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: StartPaymentDto,
  ) {
    return {
      data: await this.payments.start(id, user.id, dto.method, dto.idempotencyKey),
    };
  }

  @Post('sessions/:id/payments/callback')
  async callback(@Param('id') id: string, @Body() dto: PaymentCallbackDto) {
    return { data: await this.payments.callback(id, dto) };
  }
}
