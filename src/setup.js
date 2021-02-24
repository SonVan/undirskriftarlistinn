import { readFile } from 'fs/promises';
import { query, end } from './db.js';

const schemaFile = './sql/fake.sql';
const fakeFile = './sql/fake.sql';

async function create() {
  const data = await readFile(schemaFile);

  await query(data.toString('utf-8'));

  console.info('Schema created');
}

async function insertFake() {
  const data = await readFile(fakeFile);

  await query(data.toString('utf-8'));

  await end();

  console.info('Added fake data');
}

create().catch((err) => {
  console.error('Error creating schema', err);
});

insertFake().catch((err) => {
  console.error('Error inserting data', err);
});
