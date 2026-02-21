/**
 * Apply generated ATS_GL schema (10 and 11) to PostgreSQL using DATABASE_URL.
 */
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

function loadEnv(): void {
  const root = path.resolve(__dirname, '../..');
  const apiEnv = path.join(root, 'apps/api/.env');
  if (fs.existsSync(apiEnv)) require('dotenv').config({ path: apiEnv });
  const localEnv = path.join(__dirname, '.env');
  if (fs.existsSync(localEnv)) require('dotenv').config({ path: localEnv });
}

async function main(): Promise<void> {
  loadEnv();
  const pgUrl = process.env.DATABASE_URL;
  if (!pgUrl) {
    console.error('Set DATABASE_URL in apps/api/.env');
    process.exit(1);
  }

  const schemaDir = path.resolve(__dirname, '../../Database/scripts/ats_gl_schema');
  const file1 = path.join(schemaDir, '10-ats_gl-schema-tables.sql');
  const file2 = path.join(schemaDir, '11-ats_gl-schema-keys-indexes.sql');

  if (!fs.existsSync(file1)) {
    console.error('Run schema-convert first. Missing:', file1);
    process.exit(1);
  }

  const pg = new Client({ connectionString: pgUrl });
  await pg.connect();

  try {
    console.log('Ensuring uuid-ossp extension...');
    await pg.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('Running 10-ats_gl-schema-tables.sql...');
    const sql1 = fs.readFileSync(file1, 'utf8');
    await pg.query(sql1);
    if (fs.existsSync(file2)) {
      console.log('Running 11-ats_gl-schema-keys-indexes.sql...');
      const sql2 = fs.readFileSync(file2, 'utf8');
      const statements = sql2
        .split(';')
        .map((s) => s.replace(/--[^\n]*/g, '').trim())
        .filter((s) => s.length > 0);
      for (const stmt of statements) {
        try {
          await pg.query(stmt + ';');
        } catch (err: unknown) {
          const code = (err as { code?: string })?.code;
          // 42P16 = multiple primary keys, 42710 = duplicate_object, 42P07 = duplicate_relation (e.g. constraint/index already exists)
          if (code === '42P16' || code === '42710' || code === '42P07') {
            console.warn('Skip (already exists):', stmt.slice(0, 60) + '...');
          } else {
            throw err;
          }
        }
      }
    }
    console.log('Schema applied successfully.');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await pg.end();
  }
}

main();
