import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  SetSignatureDrinkDto,
  UpdateMeetingLinkDto,
  UpdateProfileDto,
  UpdateSettingsDto,
  UpdateSharingDto,
  UpdateSlotsDto,
  UpdateThemesDto,
  UpdateTopicSwapSettingsDto,
} from './dto/me.dto';
import { MeService } from './me.service';

@ApiTags('me')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class MeController {
  constructor(private readonly me: MeService) {}

  @Get('me')
  getMe(@CurrentUser() user: AuthUser) {
    return this.me.getMe(user.id);
  }

  @Post('me/verification')
  async verify(@CurrentUser() user: AuthUser) {
    return { data: await this.me.verifyIdentity(user.id) };
  }

  @Put('me/profile')
  updateProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.me.updateProfile(user.id, dto);
  }

  @Put('me/themes')
  updateThemes(@CurrentUser() user: AuthUser, @Body() dto: UpdateThemesDto) {
    return this.me.updateThemes(user.id, dto);
  }

  @Put('me/signature-drink')
  setDrink(@CurrentUser() user: AuthUser, @Body() dto: SetSignatureDrinkDto) {
    return this.me.setSignatureDrink(user.id, dto);
  }

  @Put('me/topic-swap-settings')
  swapSettings(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateTopicSwapSettingsDto,
  ) {
    return this.me.updateTopicSwapSettings(user.id, dto);
  }

  @Get('me/slots')
  getSlots(@CurrentUser() user: AuthUser) {
    return this.me.getSlots(user.id);
  }

  @Put('me/slots')
  updateSlots(@CurrentUser() user: AuthUser, @Body() dto: UpdateSlotsDto) {
    return this.me.updateSlots(user.id, dto);
  }

  @Put('me/meeting-link')
  updateMeetingLink(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateMeetingLinkDto,
  ) {
    return this.me.updateMeetingLink(user.id, dto);
  }

  @Put('me/sharing')
  updateSharing(@CurrentUser() user: AuthUser, @Body() dto: UpdateSharingDto) {
    return this.me.updateSharing(user.id, dto);
  }

  @Put('me/settings')
  updateSettings(@CurrentUser() user: AuthUser, @Body() dto: UpdateSettingsDto) {
    return this.me.updateSettings(user.id, dto);
  }

  @Get('me/sharing-center')
  sharingCenter(@CurrentUser() user: AuthUser) {
    return this.me.sharingCenter(user.id);
  }
}
