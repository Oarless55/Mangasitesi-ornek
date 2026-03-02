const { MongoClient } = require('mongodb');

async function migrateData() {
    const sourceClient = new MongoClient('mongodb://127.0.0.1:27020');
    const destClient = new MongoClient('mongodb://127.0.0.1:27017');

    try {
        await sourceClient.connect();
        console.log('Connected to source database (27020)');

        await destClient.connect();
        console.log('Connected to destination database (27017)');

        // Check which databases exist in the source
        const adminDb = sourceClient.db('admin');
        const dbsInfo = await adminDb.admin().listDatabases();
        const sourceDbNames = dbsInfo.databases.map(d => d.name).filter(n => !['admin', 'config', 'local'].includes(n));

        console.log('Databases to migrate:', sourceDbNames);

        for (const dbName of sourceDbNames) {
            console.log(`Migrating database: ${dbName}`);
            const sourceDb = sourceClient.db(dbName);
            const destDb = destClient.db(dbName);

            const collections = await sourceDb.listCollections().toArray();

            for (const collInfo of collections) {
                const collName = collInfo.name;
                if (collName.startsWith('system.')) continue;

                console.log(`  - Migrating collection: ${collName}`);
                const sourceColl = sourceDb.collection(collName);
                const destColl = destDb.collection(collName);

                const docs = await sourceColl.find({}).toArray();
                if (docs.length > 0) {
                    // Clear the destination collection first
                    await destColl.deleteMany({});
                    // Insert the documents
                    await destColl.insertMany(docs);
                    console.log(`    Inserted ${docs.length} documents.`);
                } else {
                    console.log(`    0 documents found.`);
                }
            }
        }

        console.log('Migration completed successfully!');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sourceClient.close();
        await destClient.close();
    }
}

migrateData();
