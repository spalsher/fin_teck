import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { CoreModule } from '../core/core.module';

// Services
import { ItemService } from './services/item.service';
import { WarehouseService } from './services/warehouse.service';
import { PurchaseOrderService } from './services/purchase-order.service';

// Controllers
import { ItemController } from './controllers/item.controller';
import { WarehouseController } from './controllers/warehouse.controller';
import { PurchaseOrderController } from './controllers/purchase-order.controller';

@Module({
  imports: [SharedModule, CoreModule],
  controllers: [
    ItemController,
    WarehouseController,
    PurchaseOrderController,
  ],
  providers: [
    ItemService,
    WarehouseService,
    PurchaseOrderService,
  ],
  exports: [
    ItemService,
    WarehouseService,
    PurchaseOrderService,
  ],
})
export class ScmModule {}
