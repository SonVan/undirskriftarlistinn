import { readFile } from 'fs/promises';
import { query, end } from './db.js';

const schemaFile = './sql/schema.sql';
const fakeFile = './sql/schema.sql';

async function create() {
  const data1 = await readFile(schemaFile);
  const data2 = await readFile(fakeFile);

  await query(data1.toString('utf-8'));
  await query(data2.toString('utf-8'));

  await end();

  console.info('Schema created');
  console.info('Added fake data');
}

create().catch((err) => {
  console.error('Error creating schema', err);
});
