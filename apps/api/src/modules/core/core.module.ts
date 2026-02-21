import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { OrganizationController } from './controllers/organization.controller';
import { BranchController } from './controllers/branch.controller';
import { OrganizationService } from './services/organization.service';
import { BranchService } from './services/branch.service';
import { DocumentSequenceService } from './services/document-sequence.service';

@Module({
  imports: [SharedModule],
  controllers: [OrganizationController, BranchController],
  providers: [
    OrganizationService,
    BranchService,
    DocumentSequenceService,
  ],
  exports: [OrganizationService, BranchService, DocumentSequenceService],
})
export class CoreModule {}
