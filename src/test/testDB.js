import pg from 'pg';
const { Pool } = pg;

import 'dotenv/config';

// if (!process.env.DATABASE_URL) {
//     console.error('❌ Error: DATABASE_URL environment variable is not set');
//     process.exit(1);
// }

const pool = new Pool({
    connectionString:
        'postgresql://PokemonBattleGame_owner:npg_L2eljRF7YsMg@ep-damp-forest-a2e5li68-pooler.eu-central-1.aws.neon.tech/PokemonBattleGame?sslmode=require',
    ssl: {
        rejectUnauthorized: false,
    },
});

const testConnection = async () => {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('✅ Database connection successful:', result.rows[0]);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    } finally {
        await pool.end();
    }
};

testConnection();
