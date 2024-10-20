const fs = require('fs');
const csv = require('csv-parser');
const { Client } = require('pg');

// Configuration de la connexion à la base de données
const dbConfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'UseYourFridge',
    password: 'admin',
    port: 5432,
};

// Chemin du fichier CSV
const csvFilePath = 'C:\\Users\\suean\\OneDrive\\Desktop\\tom\\UseYourFridgeFrontEnd\\Data\\AllFood.csv';

// Taille du lot pour l'insertion
const batchSize = 500;

async function createTable(client) {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS Recette2 (
        id SERIAL PRIMARY KEY,
        title TEXT,
        ingredients TEXT[],
        instructions TEXT,
        image_name TEXT,
        cleaned_ingredients TEXT[]
    )`;
    await client.query(createTableQuery);
}

async function insertBatch(client, batch) {
    const insertQuery = `
    INSERT INTO Recette2 (title, ingredients, instructions, image_name, cleaned_ingredients)
    VALUES ($1, $2, $3, $4, $5)`;
    
    const promises = batch.map(row => client.query(insertQuery, row));
    await Promise.all(promises);
}

function parseJsonString(jsonString) {
    try {
        return JSON.parse(jsonString.replace(/'/g, '"'));
    } catch (error) {
        console.error('Invalid JSON:', jsonString);
        return null; // Retourne null si le parsing échoue
    }
}

async function main() {
    const client = new Client(dbConfig);
    await client.connect();

    try {
        await createTable(client);

        const batch = [];
        let totalRows = 0;

        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', async (row) => {
                const ingredients = parseJsonString(row.Ingredients);
                const cleanedIngredients = parseJsonString(row.Cleaned_Ingredients);

                if (ingredients && cleanedIngredients) {
                    batch.push([
                        row.Title,
                        ingredients,
                        row.Instructions,
                        row.Image_Name,
                        cleanedIngredients
                    ]);

                    if (batch.length === batchSize) {
                        await insertBatch(client, batch);
                        totalRows += batch.length;
                        console.log(`Inserted ${totalRows} rows`);
                        batch.length = 0; // Réinitialiser le lot
                    }
                } else {
                    console.warn('Skipping row due to invalid JSON:', row);
                }
            })
            .on('end', async () => {
                // Insérer le dernier lot s'il reste des lignes
                if (batch.length > 0) {
                    await insertBatch(client, batch);
                    totalRows += batch.length;
                    console.log(`Inserted ${totalRows} rows`);
                }
                console.log("Data insertion completed successfully!");
                await client.end();
            })
            .on('error', (error) => {
                console.error('An error occurred:', error);
                client.end();
            });
    } catch (error) {
        console.error('An error occurred:', error);
        await client.end();
    }
}

main();