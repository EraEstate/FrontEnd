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
    
    // Query property images
    const res = await client.query('SELECT id, property_id, image_url, description FROM property_images ORDER BY id DESC LIMIT 10');
    console.log('Latest Property Images:');
    console.log(JSON.stringify(res.rows, null, 2));
    
    await client.end();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
