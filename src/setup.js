import { readFile } from 'fs/promises';
import { query, end } from './db.js';

const schemaFile = './sql/schema.sql';
const fakeFile = './sql/fake.sql';

async function create() {
  const schema = await readFile(schemaFile);
  const fake = await readFile(fakeFile);
  const data = schema + fake;

  await query(data.toString('utf-8'));

  await end();

  console.info('Schema created & added fake data');
}

create().catch((err) => {
  console.error('Error creating schema', err);
});


