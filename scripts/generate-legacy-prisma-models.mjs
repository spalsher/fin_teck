import fs from "node:fs";

const csvPath = "D:/Github/fin_teck/Excel/Database.csv";
const schemaPath = "D:/Github/fin_teck/apps/api/prisma/schema.prisma";

function parseCsv(content) {
  const lines = content.replace(/\r\n/g, "\n").split("\n").filter(Boolean);
  const header = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const parts = line.split(",");
    const row = {};
    for (let i = 0; i < header.length; i += 1) {
      row[header[i]] = (parts[i] ?? "").trim();
    }
    return row;
  });
}

function toPascal(input) {
  const clean = input.replace(/[^A-Za-z0-9]+/g, " ").trim();
  const out = clean
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join("");
  return out || "Table";
}

function toCamel(input) {
  const clean = input.replace(/[^A-Za-z0-9]+/g, " ").trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "field";
  const first = words[0].toLowerCase();
  const rest = words
    .slice(1)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");
  let out = `${first}${rest}`.replace(/[^A-Za-z0-9_]/g, "");
  if (/^[0-9]/.test(out)) out = `c${out}`;
  return out || "field";
}

function mapType(sqlType) {
  const t = (sqlType || "").toLowerCase();
  if (["bigint"].includes(t)) return "BigInt";
  if (["int", "smallint", "tinyint"].includes(t)) return "Int";
  if (["bit", "boolean"].includes(t)) return "Boolean";
  if (["datetime", "datetime2", "smalldatetime", "date", "time"].includes(t)) return "DateTime";
  if (["decimal", "numeric", "money", "smallmoney"].includes(t)) return "Decimal";
  if (["float", "real"].includes(t)) return "Float";
  if (["varbinary", "binary", "image", "timestamp", "rowversion"].includes(t)) return "Bytes";
  return "String";
}

const csv = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
const rows = parseCsv(csv);
const schema = fs.readFileSync(schemaPath, "utf8");

const existingMaps = new Set(
  [...schema.matchAll(/@@map\("([^"]+)"\)/g)].map((m) => m[1].toLowerCase())
);
const existingModels = new Set(
  [...schema.matchAll(/model\s+([A-Za-z0-9_]+)\s+\{/g)].map((m) => m[1])
);

const byTable = new Map();
for (const row of rows) {
  const table = row.TABLE_NAME;
  if (!table) continue;
  if (!byTable.has(table)) byTable.set(table, []);
  byTable.get(table).push(row);
}

const tables = [...byTable.keys()].filter((t) => !existingMaps.has(t.toLowerCase()));

const generated = [];
for (const table of tables) {
  const cols = byTable
    .get(table)
    .slice()
    .sort((a, b) => Number(a.ORDINAL_POSITION || "0") - Number(b.ORDINAL_POSITION || "0"));

  let modelName = `LegacyAuto${toPascal(table)}`;
  let n = 2;
  while (existingModels.has(modelName)) {
    modelName = `LegacyAuto${toPascal(table)}${n}`;
    n += 1;
  }
  existingModels.add(modelName);

  // Prefer first NOT NULL scalar that works well as id.
  let idIndex = cols.findIndex(
    (c) => c.IS_NULLABLE === "NO" && ["Int", "BigInt", "String"].includes(mapType(c.DATA_TYPE))
  );
  if (idIndex < 0) {
    idIndex = cols.findIndex((c) => ["Int", "BigInt", "String"].includes(mapType(c.DATA_TYPE)));
  }
  if (idIndex < 0) idIndex = 0;

  const usedFields = new Set();
  const lines = [];
  for (let i = 0; i < cols.length; i += 1) {
    const col = cols[i];
    let field = toCamel(col.COLUMN_NAME);
    let suffix = 2;
    while (usedFields.has(field)) {
      field = `${field}${suffix}`;
      suffix += 1;
    }
    usedFields.add(field);

    const prismaType = mapType(col.DATA_TYPE);
    const isId = i === idIndex;
    const nullable = col.IS_NULLABLE === "YES";
    const optional = !isId && nullable ? "?" : "";
    const attrs = [isId ? "@id" : "", `@map("${col.COLUMN_NAME}")`].filter(Boolean).join(" ");
    lines.push(`  ${field} ${prismaType}${optional} ${attrs}`);
  }

  generated.push(
    [
      `model ${modelName} {`,
      ...lines,
      "",
      `  @@map("${table}")`,
      "}",
      "",
    ].join("\n")
  );
}

const startMarker = "// AUTO-GENERATED LEGACY TABLES START";
const endMarker = "// AUTO-GENERATED LEGACY TABLES END";
const block = `${startMarker}\n\n${generated.join("\n")}${endMarker}\n`;

let nextSchema = schema;
const startPos = schema.indexOf(startMarker);
const endPos = schema.indexOf(endMarker);
if (startPos >= 0 && endPos > startPos) {
  nextSchema = `${schema.slice(0, startPos)}${block}${schema.slice(endPos + endMarker.length)}`;
} else {
  nextSchema = `${schema.trimEnd()}\n\n${block}`;
}

fs.writeFileSync(schemaPath, nextSchema, "utf8");
console.log(`Generated ${generated.length} legacy models from remaining tables.`);
