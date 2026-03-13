import 'dotenv/config';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixSchema() {
    try {
        console.log("Running manual schema fixes...");

        const enums = {
            "quality_status": ["pending", "approved", "rejected", "on_hold", "in_review", "released", "blocked"],
            "delivery_status": ["expected", "pending_receipt", "weighed", "pending_qc", "approved", "rejected", "on_hold", "in_review", "closed"],
            "production_status": ["draft", "scheduled", "released", "in_progress", "completed", "cancelled"],
            "item_type": ["raw_material", "finished_product"],
            "reading_type": ["initial", "reweigh", "final"],
            "exception_type": ["qc_failure", "stock_mismatch", "supplier_variance", "weight_discrepancy", "production_shortfall", "other"],
            "severity": ["low", "medium", "high", "critical"]
        };

        for (const [name, values] of Object.entries(enums)) {
            console.log(`Processing enum ${name}...`);

            // 1. Drop columns that depend on this enum to break the dependency
            if (name === "delivery_status") {
                try { await pool.query(`ALTER TABLE truck_deliveries DROP COLUMN IF EXISTS status`); } catch (e) { }
            }
            if (name === "quality_status") {
                try { await pool.query(`ALTER TABLE raw_material_batches DROP COLUMN IF EXISTS status`); } catch (e) { }
                try { await pool.query(`ALTER TABLE quality_checks DROP COLUMN IF EXISTS status`); } catch (e) { }
                try { await pool.query(`ALTER TABLE finished_product_batches DROP COLUMN IF EXISTS status`); } catch (e) { }
            }
            if (name === "production_status") {
                try { await pool.query(`ALTER TABLE production_orders DROP COLUMN IF EXISTS status`); } catch (e) { }
            }
            if (name === "item_type") {
                try { await pool.query(`ALTER TABLE stock_balances DROP COLUMN IF EXISTS item_type`); } catch (e) { }
            }
            if (name === "reading_type") {
                try { await pool.query(`ALTER TABLE weighbridge_readings DROP COLUMN IF EXISTS reading_type`); } catch (e) { }
            }

            // 2. Drop the type cascade and recreate it
            try {
                await pool.query(`DROP TYPE IF EXISTS ${name} CASCADE`);
                const valList = values.map(v => `'${v}'`).join(', ');
                await pool.query(`CREATE TYPE ${name} AS ENUM (${valList})`);
            } catch (e) {
                console.log(`Error recreating enum ${name}:`, e.message);
            }
        }

        // Fix numeric columns that fail automatic casting
        const numericFixes = [
            ['truck_deliveries', 'expected_quantity'],
            ['weighbridge_readings', 'gross_weight'],
            ['weighbridge_readings', 'tare_weight'],
            ['weighbridge_readings', 'net_weight'],
            ['weighbridge_readings', 'weighbridge_charges'],
            ['raw_material_batches', 'quantity_received'],
            ['raw_material_batches', 'quantity_consumed']
        ];

        for (const [table, column] of numericFixes) {
            try {
                console.log(`Attempting to fix numeric ${table}.${column}...`);
                await pool.query(`
                    ALTER TABLE ${table} 
                    ALTER COLUMN ${column} TYPE numeric(10,2) 
                    USING ${column}::numeric(10,2)
                `);
            } catch (e) {
                console.log(`Skipping numeric ${table}.${column}: ${e.message}`);
            }
        }

        console.log("Manual fixes completed successfully!");
    } catch (err) {
        console.error("Error during manual schema fix:", err);
    } finally {
        await pool.end();
    }
}

fixSchema();
