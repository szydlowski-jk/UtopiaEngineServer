'use strict'
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://server:serverpassword@utopiadb-qtk8d.mongodb.net/test?retryWrites=true&w=majority";

class MongoDB {
    constructor () {
        this.db = null;
        this.Connect();
    }

    async Connect () {
        try {
            const client = new MongoClient(
                uri,
                {
                    useNewUrlParser: true,
                    reconnectInterval: 1000,
                    reconnectTries: Number.MAX_VALUE
                }
            );
            await client.connect()
            this.db = client.db("UtopiaEngineDB").collection("DataSheets")
            console.log('MongoDB connection success!');
        } catch ( err ) {
            db = null
            console.log('MongoDB connection failed!');
        }
    }
}

module.exports = {
    MongoDB
}
