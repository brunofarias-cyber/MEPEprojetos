import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
}

const sql = neon(process.env.DATABASE_URL);

const main = async () => {
    console.log('📜 Reading migration file 0001...');
    try {
        const migrationPath = path.join(process.cwd(), 'migrations', '0001_sleepy_shotgun.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

        console.log('🚀 Executing migration SQL...');

        const statements = migrationSql.split('--> statement-breakpoint');

        for (const statement of statements) {
            if (statement.trim()) {
                await sql(statement);
            }
        }

        console.log('✅ Migration 0001 applied successfully');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

main();
