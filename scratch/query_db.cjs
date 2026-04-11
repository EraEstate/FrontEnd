const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.gjtprobmyoofsytkujln',
  password: 'nOZ5e2c0b4IlZxTQ',
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to DB');
    
    // Query latest properties
    const res = await client.query('SELECT id, title, created_at FROM properties ORDER BY id DESC LIMIT 5');
    console.log('Latest Properties:');
    console.log(JSON.stringify(res.rows, null, 2));
    
    if (res.rows.length > 0) {
      const propId = res.rows[0].id;
      const imgRes = await client.query('SELECT id, image_url FROM property_images WHERE property_id = $1', [propId]);
      console.log(`Images for Property ${propId}:`);
      console.log(JSON.stringify(imgRes.rows, null, 2));
    }
    
    await client.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
