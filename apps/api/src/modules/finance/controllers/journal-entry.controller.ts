import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JournalEntryService } from '../services/journal-entry.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';

class CreateJournalEntryDto {
  fiscalPeriodId: string;
  entryDate: Date;
  description: string;
  journalType: string;
  source: string;
  sourceRef?: string;
  lines: Array<{
    accountId: string;
    description: string;
    debit: number;
    credit: number;
  }>;
}

@ApiTags('finance')
@ApiBearerAuth()
@Controller('journal-entries')
export class JournalEntryController {
  constructor(private journalEntryService: JournalEntryService) {}

  @Post()
  @RequirePermissions('finance:journal-entry:create')
  @ApiOperation({ summary: 'Create a new journal entry' })
  @ApiResponse({ status: 201, description: 'Journal entry created successfully' })
  async create(
    @Body() createDto: CreateJournalEntryDto,
    @CurrentUser('branchId') branchId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.journalEntryService.create(branchId, createDto, userId);
  }

  @Get()
  @RequirePermissions('finance:journal-entry:read')
  @ApiOperation({ summary: 'Get all journal entries' })
  @ApiResponse({ status: 200, description: 'List of journal entries' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'journalType', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  async findAll(
    @CurrentUser('branchId') branchId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
    @Query('journalType') journalType?: string,
    @Query('status') status?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(pageSize, 10);

    return this.journalEntryService.findAll(branchId, {
      skip: (pageNum - 1) * pageSizeNum,
      take: pageSizeNum,
      search,
      journalType,
      status,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    });
  }

  @Get(':id')
  @RequirePermissions('finance:journal-entry:read')
  @ApiOperation({ summary: 'Get journal entry by ID' })
  @ApiResponse({ status: 200, description: 'Journal entry details' })
  async findOne(@Param('id') id: string) {
    return this.journalEntryService.findOne(id);
  }

  @Post(':id/post')
  @RequirePermissions('finance:journal-entry:post')
  @ApiOperation({ summary: 'Post journal entry' })
  @ApiResponse({ status: 200, description: 'Journal entry posted successfully' })
  async post(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.journalEntryService.post(id, userId);
  }

  @Post(':id/void')
  @RequirePermissions('finance:journal-entry:update')
  @ApiOperation({ summary: 'Void journal entry' })
  @ApiResponse({ status: 200, description: 'Journal entry voided successfully' })
  async void(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.journalEntryService.void(id, userId);
  }

  @Delete(':id')
  @RequirePermissions('finance:journal-entry:delete')
  @ApiOperation({ summary: 'Delete journal entry' })
  @ApiResponse({ status: 200, description: 'Journal entry deleted successfully' })
  async delete(@Param('id') id: string) {
    return this.journalEntryService.delete(id);
  }
}
