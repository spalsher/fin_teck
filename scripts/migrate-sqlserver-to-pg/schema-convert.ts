/**
 * Reads discover-output.json and generates PostgreSQL DDL (Option A: keep SQL Server names, quoted).
 * Output: 10-ats_gl-schema-tables.sql, 11-ats_gl-schema-keys-indexes.sql
 */

import * as fs from 'fs';
import * as path from 'path';
import { sqlServerTypeToPg, quoteId } from './type-map';
import { loadDiscoverOutput, tableOrder } from './discovery-util';
import type { DiscoverOutput } from './discovery-util';

function generateTableDdl(tableName: string, columns: Array<Record<string, unknown>>): string {
  const lines: string[] = [];
  const quotedTable = quoteId(tableName);
  lines.push(`CREATE TABLE IF NOT EXISTS ${quotedTable} (`);

  const colDefs: string[] = [];
  for (const c of columns) {
    const colName = String(c.COLUMN_NAME ?? '');
    const dataType = String(c.DATA_TYPE ?? '');
    const charMax = c.CHARACTER_MAXIMUM_LENGTH != null ? Number(c.CHARACTER_MAXIMUM_LENGTH) : null;
    const numPrec = c.NUMERIC_PRECISION != null ? Number(c.NUMERIC_PRECISION) : null;
    const numScale = c.NUMERIC_SCALE != null ? Number(c.NUMERIC_SCALE) : null;
    const defaultVal = c.COLUMN_DEFAULT != null ? String(c.COLUMN_DEFAULT) : null;
    const nullable = String(c.IS_NULLABLE ?? 'YES').toUpperCase() === 'YES';

    const { pgType, isIdentity } = sqlServerTypeToPg(dataType, charMax, numPrec, numScale, defaultVal);
    const quotedCol = quoteId(colName);
    let def = `${quotedCol} ${pgType}`;
    if (!nullable) def += ' NOT NULL';
    if (isIdentity && (pgType === 'SERIAL' || pgType === 'BIGSERIAL')) {
      // SERIAL implies NOT NULL and default
    } else if (defaultVal && !/next value for|identity/i.test(defaultVal)) {
      const pgDefault = mapDefaultToPg(defaultVal);
      if (pgDefault) def += ' DEFAULT ' + pgDefault;
    }
    colDefs.push(def);
  }
  lines.push('  ' + colDefs.join(',\n  '));
  lines.push(');');
  return lines.join('\n');
}

function mapDefaultToPg(def: string): string | null {
  const d = def.trim();
  if (/^\(?getdate\(\)\)?$/i.test(d)) return 'CURRENT_TIMESTAMP';
  if (/^\(?getutcdate\(\)\)?$/i.test(d)) return "(CURRENT_TIMESTAMP AT TIME ZONE 'UTC')";
  if (/^\(?newid\(\)\)?$/i.test(d)) return 'gen_random_uuid()';
  if (/^\(?0\)?$/.test(d)) return '0';
  if (/^\(?1\)?$/.test(d)) return '1';
  if (/^\'\'$/.test(d)) return "''";
  return null;
}

function main(): void {
  const dir = __dirname;
  const output = loadDiscoverOutput(dir);
  if (!output) {
    throw new Error('Run discover first: discover-output.json not found in ' + dir);
  }

  const tables = output.tables;
  const tableConstraints = (output.tableConstraints || []) as Array<Record<string, unknown>>;
  const keyColumnUsage = (output.keyColumnUsage || []) as Array<Record<string, unknown>>;
  const referential = (output.referentialConstraints || []) as Array<Record<string, unknown>>;

  const orderedTables = tableOrder(output);

  const ddlTables: string[] = [
    '-- Generated from discover-output.json (SQL Server ATS_GL -> PostgreSQL iteck_erp)',
    '-- Option A: keep SQL Server table/column names (quoted where needed)',
    '-- Run 00-iteck_erp-init.sql first (e.g. CREATE EXTENSION uuid-ossp)',
    '',
  ];

  for (const tableName of orderedTables) {
    const key = Object.keys(tables).find((k) => k.endsWith('.' + tableName));
    if (!key || !tables[key].length) continue;
    ddlTables.push(generateTableDdl(tableName, tables[key]));
    ddlTables.push('');
  }

  const outDir = path.resolve(dir, '../../Database/scripts/ats_gl_schema');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const file1 = path.join(outDir, '10-ats_gl-schema-tables.sql');
  fs.writeFileSync(file1, ddlTables.join('\n'), 'utf8');
  console.log('Wrote', file1);

  const ddlKeys: string[] = [
    '-- Primary keys, unique constraints, and foreign keys',
    '-- Run after 10-ats_gl-schema-tables.sql',
    '',
  ];

  const pkConstraints = tableConstraints.filter((tc) => String(tc.CONSTRAINT_TYPE) === 'PRIMARY KEY');
  for (const pk of pkConstraints) {
    const schema = String(pk.TABLE_SCHEMA ?? '');
    const table = String(pk.TABLE_NAME ?? '');
    const cname = String(pk.CONSTRAINT_NAME ?? '');
    const cols = keyColumnUsage
      .filter((k) => k.CONSTRAINT_NAME === cname && k.TABLE_NAME === table && k.TABLE_SCHEMA === schema)
      .sort((a, b) => Number(a.ORDINAL_POSITION) - Number(b.ORDINAL_POSITION))
      .map((k) => quoteId(String(k.COLUMN_NAME)));
    if (cols.length === 0) continue;
    const quotedTable = quoteId(table);
    ddlKeys.push(`ALTER TABLE ${quotedTable} ADD CONSTRAINT ${quoteId(cname)} PRIMARY KEY (${cols.join(', ')});`);
  }
  ddlKeys.push('');

  const uniqueConstraints = tableConstraints.filter((tc) => String(tc.CONSTRAINT_TYPE) === 'UNIQUE');
  for (const uq of uniqueConstraints) {
    const table = String(uq.TABLE_NAME ?? '');
    const cname = String(uq.CONSTRAINT_NAME ?? '');
    const cols = keyColumnUsage
      .filter((k) => k.CONSTRAINT_NAME === cname && k.TABLE_NAME === table)
      .sort((a, b) => Number(a.ORDINAL_POSITION) - Number(b.ORDINAL_POSITION))
      .map((k) => quoteId(String(k.COLUMN_NAME)));
    if (cols.length === 0) continue;
    const quotedTable = quoteId(table);
    ddlKeys.push(`ALTER TABLE ${quotedTable} ADD CONSTRAINT ${quoteId(cname)} UNIQUE (${cols.join(', ')});`);
  }
  ddlKeys.push('');

  for (const fk of referential) {
    const cname = String(fk.CONSTRAINT_NAME ?? '');
    const fromTable = String(fk.FROM_TABLE ?? '');
    const fromCol = String(fk.FROM_COLUMN ?? '');
    const toTable = String(fk.TO_TABLE ?? '');
    const toCol = String(fk.TO_COLUMN ?? '');
    const quotedFromTable = quoteId(fromTable);
    ddlKeys.push(
      `ALTER TABLE ${quotedFromTable} ADD CONSTRAINT ${quoteId(cname)} FOREIGN KEY (${quoteId(fromCol)}) REFERENCES ${quoteId(toTable)} (${quoteId(toCol)});`
    );
  }

  const file2 = path.join(outDir, '11-ats_gl-schema-keys-indexes.sql');
  fs.writeFileSync(file2, ddlKeys.join('\n'), 'utf8');
  console.log('Wrote', file2);
  console.log('Table order (FK-safe):', orderedTables.slice(0, 20).join(', ') + (orderedTables.length > 20 ? '...' : ''));
}

main();
