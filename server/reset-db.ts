import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
}

const sql = neon(process.env.DATABASE_URL);

const main = async () => {
    console.log('🗑️ Dropping all tables...');
    try {
        // Execute commands sequentially
        await sql`DROP SCHEMA IF EXISTS public CASCADE`;
        await sql`CREATE SCHEMA public`;
        // Grants are usually automatic for the owner, skipping explicit grants to avoid role errors

        console.log('✅ Database reset successfully');
    } catch (error) {
        console.error('❌ Reset failed:', error);
        process.exit(1);
    }
};

main();
