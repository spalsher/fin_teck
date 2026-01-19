import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { OrganizationController } from './controllers/organization.controller';
import { BranchController } from './controllers/branch.controller';
import { ServiceOfferingController } from './controllers/service-offering.controller';
import { NotificationController } from './controllers/notification.controller';
import { ActivityController } from './controllers/activity.controller';
import { OrganizationService } from './services/organization.service';
import { BranchService } from './services/branch.service';
import { ServiceOfferingService } from './services/service-offering.service';
import { DocumentSequenceService } from './services/document-sequence.service';
import { NotificationService } from './services/notification.service';

@Module({
  imports: [SharedModule],
  controllers: [OrganizationController, BranchController, ServiceOfferingController, NotificationController, ActivityController],
  providers: [
    OrganizationService,
    BranchService,
    ServiceOfferingService,
    DocumentSequenceService,
    NotificationService,
  ],
  exports: [OrganizationService, BranchService, ServiceOfferingService, DocumentSequenceService, NotificationService],
})
export class CoreModule {}
