/**
 * SQL Server to PostgreSQL data type mapping (per Database/docs/COMPATIBILITY_AND_DATA_TYPE_MAPPING.md).
 */

export function sqlServerTypeToPg(
  dataType: string,
  charMaxLength: number | null,
  numericPrecision: number | null,
  numericScale: number | null,
  columnDefault: string | null
): { pgType: string; isIdentity: boolean } {
  const dt = (dataType || '').toUpperCase();
  const isIdentity =
    typeof columnDefault === 'string' &&
    /^\s*\(?next value for|identity\s*\(/i.test(columnDefault);

  switch (dt) {
    case 'NVARCHAR':
    case 'NCHAR':
      if (charMaxLength === -1 || charMaxLength == null || charMaxLength > 4000) return { pgType: 'TEXT', isIdentity: false };
      return { pgType: `VARCHAR(${charMaxLength})`, isIdentity: false };
    case 'VARCHAR':
    case 'CHAR':
      if (charMaxLength === -1 || charMaxLength == null || charMaxLength > 8000) return { pgType: 'TEXT', isIdentity: false };
      return { pgType: dt === 'CHAR' ? `CHAR(${charMaxLength})` : `VARCHAR(${charMaxLength})`, isIdentity: false };
    case 'TEXT':
    case 'NTEXT':
      return { pgType: 'TEXT', isIdentity: false };
    case 'DATETIME':
    case 'DATETIME2':
    case 'SMALLDATETIME':
      return { pgType: 'TIMESTAMP', isIdentity: false };
    case 'DATE':
      return { pgType: 'DATE', isIdentity: false };
    case 'TIME':
      return { pgType: 'TIME', isIdentity: false };
    case 'BIT':
      return { pgType: 'BOOLEAN', isIdentity: false };
    case 'INT':
    case 'INTEGER':
      return { pgType: isIdentity ? 'SERIAL' : 'INTEGER', isIdentity };
    case 'BIGINT':
      return { pgType: isIdentity ? 'BIGSERIAL' : 'BIGINT', isIdentity };
    case 'SMALLINT':
      return { pgType: 'SMALLINT', isIdentity: false };
    case 'TINYINT':
      return { pgType: 'SMALLINT', isIdentity: false };
    case 'UNIQUEIDENTIFIER':
      return { pgType: 'UUID', isIdentity: false };
    case 'MONEY':
      return { pgType: 'NUMERIC(19,4)', isIdentity: false };
    case 'SMALLMONEY':
      return { pgType: 'NUMERIC(10,4)', isIdentity: false };
    case 'DECIMAL':
    case 'NUMERIC':
      const p = numericPrecision != null ? numericPrecision : 18;
      const s = numericScale != null ? numericScale : 0;
      return { pgType: `NUMERIC(${p},${s})`, isIdentity: false };
    case 'REAL':
      return { pgType: 'REAL', isIdentity: false };
    case 'FLOAT':
      return { pgType: 'DOUBLE PRECISION', isIdentity: false };
    case 'IMAGE':
    case 'VARBINARY':
    case 'BINARY':
      return { pgType: 'BYTEA', isIdentity: false };
    case 'ROWVERSION':
    case 'TIMESTAMP':
      return { pgType: 'BYTEA', isIdentity: false };
    case 'XML':
      return { pgType: 'TEXT', isIdentity: false };
    default:
      return { pgType: 'TEXT', isIdentity: false };
  }
}

/** Quote identifier for PostgreSQL (mixed case / reserved). */
export function quoteId(name: string): string {
  if (!name) return '""';
  if (/^[a-z_][a-z0-9_]*$/.test(name)) return name;
  return `"${name.replace(/"/g, '""')}"`;
}
