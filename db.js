const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Vantar DATABASE_URL');
  process.exit(1);
}

/**
 * Framkvæmir SQL fyrirspurn á gagnagrunn sem keyrir á `DATABASE_URL`,
 * skilgreint í `.env`
 *
 * @param {string} q Query til að keyra
 * @param {array} values Fylki af gildum fyrir query
 * @returns {object} Hlut með niðurstöðu af því að keyra fyrirspurn
 */
async function query(q, values = []) {
  const client = new Client({ connectionString });

  await client.connect();

  try {
    const result = await client.query(q, values);

    return result;
  } catch (err) {
    throw err;
  } finally {
    await client.end();
  }
}

/**
 * Bætir við undirskrift.
 *
 * @param {array} data Fylki af gögnum fyrir undirskrift
 * @returns {object} Hlut með niðurstöðu af því að keyra fyrirspurn
 */
async function insert(data) {
  const q = `
INSERT INTO signatures
(name, nationalid, comment, anonymous, signed)
VALUES
($1, $2, $3, $4, current_timestamp)`;
  const values = [data.name, data.nationalid, data.comment, data.anonymous];

  return query(q, values);
}

/**
 * Sækir öll undirskrift
 *
 * @returns {array} Fylki af öllum undirskriftum
 */
async function select() {
  const result = await query('SELECT * FROM signatures ORDER BY id');

  return result.rows;
}

module.exports = {
  insert,
  select,
};
