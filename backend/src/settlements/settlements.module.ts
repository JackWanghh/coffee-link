import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { SettlementsService } from './settlements.service';

@Module({
  imports: [NotificationsModule],
  providers: [SettlementsService],
  exports: [SettlementsService],
})
export class SettlementsModule {}
