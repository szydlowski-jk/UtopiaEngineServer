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

    async Insert ( data ) {
        if ( this.db ) {
            try {
                await this.db.insertOne( data );
            } catch ( err ) {
                console.error('MongoDB insert of data failed!');
                console.error(data);
            }
        }
    }

    async Get ( gameId, out ) {
        if ( this.db ) {
            let result;
            try {
                result = this.db.findOne({gameId: gameId}, ( err, doc ) => {
                    console.log( "DOC: ", doc );
                    out = doc;
                    result = doc;
//                    return doc;
                // }).then( (obj) => {
                //     console.log( "THEN: ", obj );
                //     result = obj;
                });
                console.log( "RES: ", result );
//                return result;
            } catch ( err ) {
                console.error(`MongoDB find failed! gameId:${gameId}`);
            }
            return result;
        }
    }
}

module.exports = {
    MongoDB
}
