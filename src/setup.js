import { readFile } from 'fs/promises';
import faker from 'faker';
import format from 'pg-format';
import bcrypt from 'bcrypt';
import { query, end } from './db.js';

const schemaFile = './sql/schema.sql';
// const fakeFile = './sql/fake.sql';

async function create() {
  const schema = await readFile(schemaFile);
  // const fake = await readFile(fakeFile);
  let data = schema; // start adding everything into a single long query
  // data = data + "TRUNCATE TABLE signatures;";
  data += 'TRUNCATE TABLE users;';

  for (let i = 0; i < 500; i += 1) {
    const randomName = faker.name.findName();
    const randomNationalId = Math.random().toString().slice(2, 12);
    let randomComment = ''; if (Math.random() < 0.5) { randomComment = faker.lorem.sentence(); }
    let randomAnonymous = false; if (Math.random() < 0.5) { randomAnonymous = true; }
    const randomDate = faker.date.between('2021-02-10', '2021-02-25');

    const values = [randomName, randomNationalId, randomComment, randomAnonymous, randomDate];
    const queryLine = format('INSERT INTO signatures (name, nationalId, comment, anonymous, signed) VALUES (%L);', values);
    data += queryLine;
  }

  const hashedPassword = await bcrypt.hash('123', 11);
  data += `INSERT INTO users (username, password, name, email, admin) VALUES ('admin', '${hashedPassword}', 'Admin', 'admin@admin.com', true);`;

  await query(data.toString('utf-8'));
  await end();

  console.info('Schema created & added 500 fake data');
  console.info('Added 1 user (username: admin, password: 123)');
}

create().catch((err) => {
  console.error('Error creating schema', err);
});
