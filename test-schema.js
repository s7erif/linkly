const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL
  });
  await client.connect();
  
  const res = await client.query(`
    SELECT
      column_name,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_name='EditorSession';
  `);
  
  console.log("Columns for EditorSession:");
  console.table(res.rows);
  
  const constraints = await client.query(`
    SELECT
      conname,
      contype,
      pg_get_constraintdef(oid) as def
    FROM pg_constraint
    WHERE conrelid = 'public."EditorSession"'::regclass;
  `);
  
  console.log("Constraints for EditorSession:");
  console.table(constraints.rows);
  
  await client.end();
}

main().catch(console.error);
