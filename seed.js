// seed.js - A script to populate the database from inventory-data.txt

// Load environment variables (important for DATABASE_URL)
require('dotenv').config();
const fs = require('fs').promises; // Use promise-based fs for async operations
const path = require('path');
const pool = require('./database'); // Your existing database connection pool

async function seedDatabase() {
  let client;
  try {
    client = await pool.connect(); // Get a client from the pool
    console.log("Database connection established for seeding.");

    // --- 1. Read inventory data from file ---
    const dataFilePath = path.join(__dirname, 'inventory-data.txt');
    const rawData = await fs.readFile(dataFilePath, 'utf8');
    const inventoryData = JSON.parse(rawData);
    console.log(`Successfully read ${inventoryData.length} inventory items from ${dataFilePath}`);

    // --- 2. Populate 'classification' table with unique names ---
    const uniqueClassifications = [...new Set(inventoryData.map(item => item.classification_name))];
    
    console.log("Ensuring classifications exist...");
    for (const name of uniqueClassifications) {
      // Check if classification already exists
      const checkSql = 'SELECT classification_id FROM classification WHERE classification_name = $1';
      const result = await client.query(checkSql, [name]);

      if (result.rows.length === 0) {
        // Insert if it doesn't exist
        const insertSql = 'INSERT INTO classification (classification_name) VALUES ($1) RETURNING classification_id';
        await client.query(insertSql, [name]);
        console.log(`Inserted new classification: ${name}`);
      } else {
        console.log(`Classification '${name}' already exists.`);
      }
    }

    // --- 3. Truncate 'inventory' table before inserting (Optional: For fresh seed) ---
    // Uncomment the line below if you want to clear existing inventory data before seeding
    // await client.query('TRUNCATE TABLE inventory RESTART IDENTITY CASCADE');
    // console.log("Truncated existing inventory data.");

    // --- 4. Insert inventory items into 'inventory' table ---
    console.log("Inserting inventory items...");
    for (const item of inventoryData) {
      // Get classification_id for the current item's classification_name
      const getClassificationIdSql = 'SELECT classification_id FROM classification WHERE classification_name = $1';
      const classificationResult = await client.query(getClassificationIdSql, [item.classification_name]);
      
      if (classificationResult.rows.length === 0) {
        console.warn(`Skipping item '${item.inv_make} ${item.inv_model}': Classification '${item.classification_name}' not found.`);
        continue; // Skip this item if classification doesn't exist
      }
      const classificationId = classificationResult.rows[0].classification_id;

      const insertInvSql = `
        INSERT INTO inventory (
          inv_make, inv_model, inv_year, inv_description, inv_image,
          inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (inv_make, inv_model, inv_year, classification_id) DO NOTHING;
        -- ON CONFLICT is useful to prevent duplicate inserts if you run the script multiple times
        -- You might need to add a UNIQUE constraint to (inv_make, inv_model, inv_year, classification_id) for this to work
      `;
      const values = [
        item.inv_make, item.inv_model, item.inv_year, item.inv_description,
        item.inv_image, item.inv_thumbnail, item.inv_price, item.inv_miles,
        item.inv_color, classificationId
      ];
      await client.query(insertInvSql, values);
      console.log(`Inserted: ${item.inv_make} ${item.inv_model}`);
    }

    console.log("Database seeding complete!");

  } catch (error) {
    console.error("Database seeding failed:", error);
    if (error.message.includes("syntax error") && error.message.includes("JSON")) {
      console.error("Check your inventory-data.txt for valid JSON syntax.");
    }
  } finally {
    if (client) {
      client.release(); // Release the client back to the pool
      console.log("Database client released.");
    }
    pool.end(); // Close the pool after seeding
    console.log("Database pool closed.");
  }
}

// Execute the seeding function
seedDatabase();
