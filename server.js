//#region dependencies
const express = require('express');
const cors = require('cors');
const app = express();
const port = (process.env.PORT || 3000);
const engine = require('./engine.js');
const mongodb = require('./mongodb.js');
//#endregion dependencies

const pageRoot = { root: __dirname + '/page' };

app.use(cors());
app.use(express.json());

//#region routing
app.get('/', ( req, res ) => {
    res.sendFile('index.html', pageRoot );
});

app.get('/favicon.ico', ( req, res ) => {
    res.sendFile( 'favicon.ico', pageRoot );
})


app.get('/g/game.js', ( req, res ) => {
    res.sendFile('game.js', pageRoot );
})

app.get('/g/:gameid(\\w{6})', ( req, res ) => {
    res.sendFile('game.html', pageRoot );
});

app.get('/g/:gameid(\\w{6})/data', ( req, res ) => {
    console.log('001');
    let gameid = req.params['gameid'];
    let result;
    mdb.Get( gameid, function(back) {
        console.log('THAT Callback: ', back);
        result = back;
//        res.json( { result: true, data: out, res: result } );
//        res.json( {dupa: "dupa blada"})
    } );
    res.json( {dupa: "dupa"})
});


app.use('/api/newgame', ( req, res ) => {
    let gameid = generateGameId();
    let data = {
        gameId: gameid,
        data: new engine.UtopiaData(),
        log: []
    };
    mdb.Insert( data );
    res.json( { gameId: gameid } );
})


app.use( ( req, res, next ) => {
//    res.status(404).send('Oh well...');
    res.sendFile('index.html', pageRoot );
})


app.listen(port, () => {
    console.log(`Utopia Engine Server started [port:${port}]`);
});
//#endregion routing

const mdb = new mongodb.MongoDB();


//#region functions
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
    return makeid(6);
}
//#endregion functions





// #############################################################################

//let dbcoll;


//let ue = new uejs.UtopiaEngine()

//DBConnect()


// ex.post('/game/:gameId/:action', (req, res) => {
//     if ( req.body != null ) {
//         // TODO HERE
//     }
//     res.send(req.params)
// })

// ex.get('/test/new', (req, res) => {
//     console.log('new game')
//     let id = newGame()
//     let ue = new uejs.UtopiaEngine()
//     ue.data.gameid = id
//     res.send( ue.data )
// })

// ex.get('/test/get/:id', (req, res) => {
//     console.log('get game' + req.params)
//     DBget( req.params['id'] )
//     res.send( ue.data )
// })

// ex.get('/test/day/:id', (req, res) => {
//     console.log('get game' + req.params)
//     DBget( req.params['id'] )
//     ue.doAction('doRest', {})
//     DBset( req.params['id'], ue.data )
//     res.send( ue.data )
// })


// // ex.get('/', (req, res) => {
// //     res.send('Utopia Engine')
// // })

// // https://utopiaengine.herokuapp.com/3sv5jd/action

// ex.get('/ue', (req, res) => {
//     res.send(JSON.stringify(ue.data))
// })


// ex.post('/API', (req, res) => {
//     res.send( handleApiCall( req.body ) )
//     // console.log(req.body)
//     // res.send(req.body)
// })

// ex.get('/API', (req, res) => {
//     console.log(req.body)
//     res.send(ue.getActions())
// })

// ex.listen(port, () => {
//     console.log(`listening on port ${port}`)
// })


// // function connectDB () {
// //     client.connect(err => {
// //         const dbcol = client.db("UtopiaEngineDB").collection("DataSheets")
// //         let ued = new UtopiaData()



// //        const collection = client.db("test").collection("devices");
// //        console.log(collection);
//         // perform actions on the collection object
//     //     client.close();
//     // });

// //}


// function iterateFunc(doc) {
//     console.log(JSON.stringify(doc, null, 4));
//  }

// function errorFunc(error) {
//     console.log(error);
// }


// async function DBConnect () {
//     console.log('DB connect')
//     try {
//         const client = new MongoClient(uri, { useNewUrlParser: true, reconnectInterval: 1000, reconnectTries: Number.MAX_VALUE });
//         await client.connect()
//         dbcoll = client.db("UtopiaEngineDB").collection("DataSheets")
//     } catch ( err ) {
//         dbcoll = null
//     }

// }

// // function DBDisconnect () {
// //     client.close
// // }

// async function DBget ( id ) {
//     console.log('DBget ' + id);

//     if ( dbcoll ) {
//         try {
//             let cursor = await dbcoll.findOne({gameId: id})
//             ue.data = cursor.data
//             console.log(ue.data)
//         } catch ( err ) {
//             console.log( 'DBget error: ' + err )
//         }
//     }
// }

// function DBset ( id, data ) {
//     if ( dbcoll ) {
//         try {
//             dbcoll.updateOne( { gameId: id }, { $set: { data: ue.data } })
//         } catch ( err ) {
//             console.log( err )
//         }
//     }
// }


// function newGame () {
//     let data = {}
//     data.gameId = generateGameId()
//     data.data = new uejs.UtopiaData()
//     data.history = []

//     if ( dbcoll ) {
//         try {
//             dbcoll.insertOne( data )
//         } catch ( err ) {
//             console.log( err )
//         }
//     }

//     return data.gameId
// }

// function validateBody ( body ) {
//     if ( body.action != null &&
//          body.gameId != null &&
//          body.params != null ) {
//              return true
//     }

//     return false
// }

// function getDBdata ( gameId ) {
//     // todo
// }

// function handleApiCall ( body ) {
//     if ( body.action == "getState" ) {
//         return {result: true, state: ue.data, req: body}
//     }

//     let result = ue.doAction( body.action, body.params )
//     result.data = ue.data
//     result.req = body

//     return result
// }

// /* https://stackoverflow.com/a/1349426 */
// function makeid(length) {
//     var result           = '';
//     var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
//     var charactersLength = characters.length;
//     for ( var i = 0; i < length; i++ ) {
//        result += characters.charAt(Math.floor(Math.random() * charactersLength));
//     }
//     return result;
// }

// function generateGameId () {
//     return makeid(6)
// }