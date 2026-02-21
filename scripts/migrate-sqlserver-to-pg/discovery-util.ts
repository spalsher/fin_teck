/**
 * Load discover-output.json and compute FK-safe table order for native migration.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface DiscoverOutput {
  tables: Record<string, Array<Record<string, unknown>>>;
  tableConstraints?: Array<Record<string, unknown>>;
  keyColumnUsage?: Array<Record<string, unknown>>;
  referentialConstraints?: Array<Record<string, unknown>>;
  tableList?: string[];
}

export function loadDiscoverOutput(dir: string): DiscoverOutput | null {
  const p = path.join(dir, 'discover-output.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8')) as DiscoverOutput;
}

/** Topological sort: parent (referenced) tables before children. */
export function tableOrder(output: DiscoverOutput): string[] {
  const tables = output.tableList ?? Object.keys(output.tables).map((k) => k.split('.').pop()!);
  const refs = (output.referentialConstraints || []) as Array<{ FROM_TABLE?: string; TO_TABLE?: string }>;
  const edges = new Map<string, Set<string>>();
  for (const r of refs) {
    const from = String(r.FROM_TABLE ?? '');
    const to = String(r.TO_TABLE ?? '');
    if (!from || !to || from === to) continue;
    if (!edges.has(from)) edges.set(from, new Set());
    edges.get(from)!.add(to);
  }
  const sorted: string[] = [];
  const visited = new Set<string>();
  const visit = (t: string) => {
    if (visited.has(t)) return;
    visited.add(t);
    for (const u of edges.get(t) ?? []) {
      if (tables.includes(u)) visit(u);
    }
    sorted.push(t);
  };
  for (const t of tables) {
    visit(t);
  }
  return sorted.reverse();
}

/** Get columns for a table (key = schema.table or dbo.TableName). */
export function getTableColumns(output: DiscoverOutput, tableName: string): Array<Record<string, unknown>> {
  const key = Object.keys(output.tables).find((k) => k.endsWith('.' + tableName));
  if (!key) return [];
  return output.tables[key] || [];
}

/** Infer transform for native ETL from SQL Server DATA_TYPE. */
export function getTransformForSqlType(dataType: string): 'bool' | 'date' | 'uuid' | 'json' | undefined {
  const dt = (dataType || '').toUpperCase();
  if (dt === 'BIT') return 'bool';
  if (['DATETIME', 'DATETIME2', 'SMALLDATETIME', 'DATE'].includes(dt)) return 'date';
  if (dt === 'UNIQUEIDENTIFIER') return 'uuid';
  return undefined;
}
