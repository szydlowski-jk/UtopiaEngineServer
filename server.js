const express = require('express')
const cors = require('cors')
const ex = express()
const port = process.env.PORT || 3000


const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://server:serverpassword@utopiadb-qtk8d.mongodb.net/test?retryWrites=true&w=majority";
let dbcoll;

ex.use(cors())
ex.use(express.json())

const ue = require('./engine.js')

ex.use('/', express.static('page'))

ex.post('/game/:gameId/:action', (req, res) => {
    if ( req.body != null ) {
        // TODO HERE
    }
    res.send(req.params)
})

ex.get('/test/new', (req, res) => {
    console.log('new game')
    let id = newGame()
    ue.data.gameid = id
    res.send( ue.data )
})

ex.get('/test/get/:id', (req, res) => {
    console.log('get game')
    DBget( req.params[id] )
    res.send( ue.data )
})

// ex.get('/', (req, res) => {
//     res.send('Utopia Engine')
// })

// https://utopiaengine.herokuapp.com/3sv5jd/action

ex.get('/ue', (req, res) => {
    res.send(JSON.stringify(ue.data))
})


ex.post('/API', (req, res) => {
    res.send( handleApiCall( req.body ) )
    // console.log(req.body)
    // res.send(req.body)
})

ex.get('/API', (req, res) => {
    console.log(req.body)
    res.send(ue.getActions())
})

ex.listen(port, () => {
    console.log(`listening on port ${port}`)
})


// function connectDB () {
//     client.connect(err => {
//         const dbcol = client.db("UtopiaEngineDB").collection("DataSheets")
//         let ued = new UtopiaData()



//        const collection = client.db("test").collection("devices");
//        console.log(collection);
        // perform actions on the collection object
    //     client.close();
    // });

//}


async function DBConnect () {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, reconnectInterval: 1000, reconnectTries: Number.MAX_VALUE });
        await client.connect()
        dbcoll = client.db("UtopiaEngineDB").collection("DataSheets")
    } catch ( err ) {
        dbcoll = null
    }

}

// function DBDisconnect () {
//     client.close
// }

function DBget ( id ) {
    if ( dbcoll ) {
        try {
            ue.data = dbcoll.find({gameId: id})
            console.log(data)
        } catch ( err ) {
            console.log( err )
        }
    }
}

function DBset ( id, data ) {
    if ( dbcoll ) {
        try {
            dbcoll.updateOne( { gameId: id }, { $data: data })
        } catch ( err ) {
            console.log( err )
        }
    }
}


function newGame () {
    let data = {}
    data.gameId = generateGameId()
    data.data = new UtopiaData()
    data.history = []

    if ( dbcoll ) {
        try {
            dbcoll.insertOne( data )
        } catch ( err ) {
            console.log( err )
        }
    }

    return data.gameId
}

function validateBody ( body ) {
    if ( body.action != null &&
         body.gameId != null &&
         body.params != null ) {
             return true
    }

    return false
}

function getDBdata ( gameId ) {
    // todo
}

function handleApiCall ( body ) {
    if ( body.action == "getState" ) {
        return {result: true, state: ue.data, req: body}
    }

    let result = ue.doAction( body.action, body.params )
    result.data = ue.data
    result.req = body

    return result
}

/* https://stackoverflow.com/a/1349426 */
function makeid(length) {
    var result           = '';
    var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function generateGameId () {
    return makeid(6)
}