import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { CoreModule } from '../core/core.module';

// Services
import { CustomerService } from './services/customer.service';
import { InvoiceService } from './services/invoice.service';
import { ReceiptService } from './services/receipt.service';
import { VendorService } from './services/vendor.service';
import { BillService } from './services/bill.service';
import { ChartOfAccountService } from './services/chart-of-account.service';
import { JournalEntryService } from './services/journal-entry.service';
import { BankAccountService } from './services/bank-account.service';
import { GlReportsService } from './services/gl-reports.service';
import { FinancePostingService } from './services/finance-posting.service';
import { TaxCategoryService } from './services/tax-category.service';
import { VehicleBookingService } from './services/vehicle-booking.service';
import { ProformaInvoiceService } from './services/proforma-invoice.service';

// Controllers
import { CustomerController } from './controllers/customer.controller';
import { InvoiceController } from './controllers/invoice.controller';
import { ReceiptController } from './controllers/receipt.controller';
import { VendorController } from './controllers/vendor.controller';
import { BillController } from './controllers/bill.controller';
import { ChartOfAccountController } from './controllers/chart-of-account.controller';
import { JournalEntryController } from './controllers/journal-entry.controller';
import { BankAccountController } from './controllers/bank-account.controller';
import { GlReportsController } from './controllers/gl-reports.controller';
import { TaxCategoryController } from './controllers/tax-category.controller';
import { VehicleBookingController } from './controllers/vehicle-booking.controller';
import { ProformaInvoiceController } from './controllers/proforma-invoice.controller';

@Module({
  imports: [SharedModule, CoreModule],
  controllers: [
    CustomerController,
    InvoiceController,
    ReceiptController,
    VendorController,
    BillController,
    ChartOfAccountController,
    JournalEntryController,
    BankAccountController,
    GlReportsController,
    TaxCategoryController,
    VehicleBookingController,
    ProformaInvoiceController,
  ],
  providers: [
    CustomerService,
    InvoiceService,
    ReceiptService,
    VendorService,
    BillService,
    ChartOfAccountService,
    JournalEntryService,
    BankAccountService,
    GlReportsService,
    FinancePostingService,
    TaxCategoryService,
    VehicleBookingService,
    ProformaInvoiceService,
  ],
  exports: [
    CustomerService,
    InvoiceService,
    ReceiptService,
    VendorService,
    BillService,
    ChartOfAccountService,
    JournalEntryService,
    BankAccountService,
    GlReportsService,
  ],
})
export class FinanceModule {}
