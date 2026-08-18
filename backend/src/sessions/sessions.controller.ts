import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  AcceptInvitationDto,
  CreateCoffeeInvitationDto,
  CreateTopicSwapInvitationDto,
  DeclineInvitationDto,
  ResubmitSlotsDto,
  SessionListQuery,
} from './dto/session.dto';
import { SessionsService } from './sessions.service';

@ApiTags('sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  @Post('invitations/coffee')
  async createCoffee(@CurrentUser() user: AuthUser, @Body() dto: CreateCoffeeInvitationDto) {
    return { data: await this.sessions.createCoffeeInvitation(user.id, dto) };
  }

  @Post('invitations/topic-swaps')
  async createSwap(@CurrentUser() user: AuthUser, @Body() dto: CreateTopicSwapInvitationDto) {
    return { data: await this.sessions.createTopicSwapInvitation(user.id, dto) };
  }

  @Get('sessions')
  list(@CurrentUser() user: AuthUser, @Query() query: SessionListQuery) {
    return this.sessions.list(user.id, query);
  }

  @Get('sessions/:id')
  detail(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.sessions.detail(id, user.id);
  }

  @Post('sessions/:id/accept')
  async accept(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: AcceptInvitationDto) {
    return { data: await this.sessions.accept(id, user.id, dto) };
  }

  @Post('sessions/:id/decline')
  async decline(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: DeclineInvitationDto) {
    return { data: await this.sessions.decline(id, user.id, dto.reason) };
  }

  @Post('sessions/:id/slots/resubmit')
  async resubmit(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: ResubmitSlotsDto) {
    return { data: await this.sessions.resubmitSlots(id, user.id, dto.slotIds) };
  }

  @Post('sessions/:id/cancel')
  async cancel(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return { data: await this.sessions.cancel(id, user.id) };
  }
}
