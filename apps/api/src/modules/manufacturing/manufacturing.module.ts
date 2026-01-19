import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { CoreModule } from '../core/core.module';

// Services
import { BomService } from './services/bom.service';
import { ProductionOrderService } from './services/production-order.service';

// Controllers
import { BomController } from './controllers/bom.controller';
import { ProductionOrderController } from './controllers/production-order.controller';

@Module({
  imports: [SharedModule, CoreModule],
  controllers: [BomController, ProductionOrderController],
  providers: [BomService, ProductionOrderService],
  exports: [BomService, ProductionOrderService],
})
export class ManufacturingModule {}
