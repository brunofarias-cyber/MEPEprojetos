import "dotenv/config";
import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
    try {
        console.log("Running migration 002_add_achievements.sql...");

        const migrationSQL = readFileSync(
            join(__dirname, "../migrations/002_add_achievements.sql"),
            "utf-8"
        );

        await db.execute(sql.raw(migrationSQL));

        console.log("✅ Migration completed successfully!");

        // Verify achievements were added
        const result = await db.execute(sql`SELECT COUNT(*) as count FROM achievements`);
        console.log(`Total achievements in database: ${result.rows[0]?.count || 0}`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

runMigration();
