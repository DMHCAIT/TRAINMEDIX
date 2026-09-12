#!/usr/bin/env node

import { connect } from './db-connect.mjs';

const client = await connect();

async function main() {
  await client.query('BEGIN');

  const groups = await client.query(`
    SELECT lower(trim(name)) AS key, array_agg(id ORDER BY created_at) AS ids
      FROM hospitals
     GROUP BY 1
    HAVING COUNT(*) > 1
  `);

  for (const g of groups.rows) {
    const rows = await client.query(
      `SELECT h.id, h.name, h.city, h.cities, h.created_at,
              (SELECT COUNT(*) FROM hospital_departments hd WHERE hd.hospital_id = h.id) AS offerings,
              (SELECT COUNT(*) FROM bookings b WHERE b.hospital_id = h.id) AS bookings,
              (SELECT COUNT(*) FROM certificates c WHERE c.hospital_id = h.id) AS certificates
         FROM hospitals h
        WHERE h.id = ANY($1::uuid[])`,
      [g.ids]
    );

    // Keep the row carrying the most data, oldest wins ties.
    const sorted = rows.rows.sort((a, b) => {
      const aData = Number(a.offerings) + Number(a.bookings) + Number(a.certificates);
      const bData = Number(b.offerings) + Number(b.bookings) + Number(b.certificates);
      if (aData !== bData) return bData - aData;
      return new Date(a.created_at) - new Date(b.created_at);
    });

    const keeper = sorted[0];
    const losers = sorted.slice(1);

    const mergedCities = new Set();
    sorted.forEach((r) => (r.cities || (r.city ? [r.city] : [])).forEach((c) => mergedCities.add(c)));

    console.log(`\n${keeper.name}: keeping ${keeper.id}`);

    for (const loser of losers) {
      // Move offerings that would not collide with the keeper's existing ones.
      await client.query(
        `UPDATE hospital_departments hd
            SET hospital_id = $1
          WHERE hd.hospital_id = $2
            AND NOT EXISTS (
              SELECT 1 FROM hospital_departments k
               WHERE k.hospital_id = $1
                 AND k.department_id = hd.department_id
                 AND k.city IS NOT DISTINCT FROM hd.city
            )`,
        [keeper.id, loser.id]
      );

      // Fold pricing from colliding offerings into the keeper's row, then drop them.
      await client.query(
        `UPDATE hospital_departments k
            SET pricing = COALESCE(k.pricing, '{}'::jsonb) || COALESCE(d.pricing, '{}'::jsonb)
           FROM hospital_departments d
          WHERE d.hospital_id = $2
            AND k.hospital_id = $1
            AND k.department_id = d.department_id
            AND k.city IS NOT DISTINCT FROM d.city
            AND COALESCE(d.pricing, '{}'::jsonb) <> '{}'::jsonb`,
        [keeper.id, loser.id]
      );

      const del = await client.query('DELETE FROM hospital_departments WHERE hospital_id = $1', [loser.id]);
      await client.query('UPDATE bookings SET hospital_id = $1 WHERE hospital_id = $2', [keeper.id, loser.id]);
      await client.query('UPDATE certificates SET hospital_id = $1 WHERE hospital_id = $2', [keeper.id, loser.id]);
      await client.query('DELETE FROM hospitals WHERE id = $1', [loser.id]);

      console.log(`  removed ${loser.id} (dropped ${del.rowCount} redundant offering rows)`);
    }

    await client.query('UPDATE hospitals SET cities = $1 WHERE id = $2', [Array.from(mergedCities), keeper.id]);
  }

  // Prevent the same hospital from being created twice.
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS hospitals_unique_name
    ON hospitals (lower(trim(name)))
  `);

  await client.query('COMMIT');

  const left = await client.query(`
    SELECT name, COUNT(*) FROM hospitals GROUP BY name HAVING COUNT(*) > 1
  `);
  console.log(left.rows.length === 0 ? '\nNo duplicate hospitals remain.' : `\nStill duplicated: ${JSON.stringify(left.rows)}`);

  const total = await client.query('SELECT COUNT(*) FROM hospitals');
  console.log(`Hospitals in table: ${total.rows[0].count}`);
}

main()
  .catch(async (err) => {
    await client.query('ROLLBACK');
    console.error('Cleanup failed, rolled back:', err.message);
    process.exitCode = 1;
  })
  .finally(() => client.end());
