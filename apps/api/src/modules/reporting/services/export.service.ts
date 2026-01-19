import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  async exportToCSV(data: {
    entity: string;
    filters?: any;
    columns?: string[];
  }): Promise<string> {
    const records = await this.fetchRecords(data.entity, data.filters);
    
    if (records.length === 0) {
      return '';
    }

    // Determine columns
    const columns = data.columns || Object.keys(records[0]);
    
    // Create CSV header
    const header = columns.join(',');
    
    // Create CSV rows
    const rows = records.map(record => {
      return columns.map(col => {
        const value = record[col];
        // Escape commas and quotes
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',');
    });

    return [header, ...rows].join('\n');
  }

  async exportToJSON(data: {
    entity: string;
    filters?: any;
    columns?: string[];
  }): Promise<any[]> {
    const records = await this.fetchRecords(data.entity, data.filters);
    
    if (!data.columns) {
      return records;
    }

    // Filter columns
    return records.map(record => {
      const filtered: any = {};
      data.columns!.forEach(col => {
        if (col in record) {
          filtered[col] = record[col];
        }
      });
      return filtered;
    });
  }

  private async fetchRecords(entity: string, filters?: any): Promise<any[]> {
    // Map entity names to Prisma models
    const entityMap: Record<string, any> = {
      customers: this.prisma.customer,
      vendors: this.prisma.vendor,
      invoices: this.prisma.invoice,
      bills: this.prisma.bill,
      receipts: this.prisma.receipt,
      items: this.prisma.item,
      warehouses: this.prisma.warehouse,
      purchaseOrders: this.prisma.purchaseOrder,
      employees: this.prisma.employee,
      assets: this.prisma.asset,
      boms: this.prisma.bOM,
      productionOrders: this.prisma.productionOrder,
      journals: this.prisma.journalEntry,
      banks: this.prisma.bankAccount,
    };

    const model = entityMap[entity];
    
    if (!model) {
      throw new Error(`Unknown entity: ${entity}`);
    }

    // Fetch records with filters
    const records = await model.findMany({
      where: filters || {},
      take: 1000, // Limit to prevent memory issues
    });

    // Convert to plain objects and handle dates/JSON
    return records.map((record: any) => {
      const plain: any = {};
      Object.keys(record).forEach(key => {
        const value = record[key];
        if (value instanceof Date) {
          plain[key] = value.toISOString();
        } else if (typeof value === 'object' && value !== null) {
          plain[key] = JSON.stringify(value);
        } else {
          plain[key] = value;
        }
      });
      return plain;
    });
  }
}
