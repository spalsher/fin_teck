import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';

// Services
import { AssetService } from './services/asset.service';

// Controllers
import { AssetController } from './controllers/asset.controller';

@Module({
  imports: [SharedModule],
  controllers: [AssetController],
  providers: [AssetService],
  exports: [AssetService],
})
export class AssetModule {}
