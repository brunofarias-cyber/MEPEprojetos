import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
}

const sql = neon(process.env.DATABASE_URL);

const main = async () => {
    console.log('🔍 Checking tables...');
    try {
        const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

        console.log('📊 Tables found:', result.map(r => r.table_name));

        if (result.length === 0) {
            console.log('❌ No tables found in public schema');
        } else {
            console.log(`✅ Found ${result.length} tables`);
        }
    } catch (error) {
        console.error('❌ Check failed:', error);
    }
};

main();
