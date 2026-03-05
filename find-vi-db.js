const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/madara_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function findVietnamese() {
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', async function () {
        console.log("Connected to MongoDB!");

        const collections = await db.db.listCollections().toArray();
        for (const col of collections) {
            const collection = db.db.collection(col.name);
            const allDocs = await collection.find({}).toArray();
            for (const doc of allDocs) {
                const str = JSON.stringify(doc);
                if (str.includes("CÓ THỂ BẠN CŨNG THÍCH") || str.includes("CŨNG THÍCH") || str.includes("Thg")) {
                    console.log(`Found string in collection: ${col.name}, Doc ID: ${doc._id}`);
                }
            }
        }

        console.log("Search database finish!");
        mongoose.connection.close();
    });
}

findVietnamese();
