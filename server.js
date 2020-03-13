const express = require('express')
const cors = require('cors')
const ex = express()
const port = process.env.PORT || 3000


const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://server:serverpassword@utopiadb-qtk8d.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  console.log(collection);
  // perform actions on the collection object
  client.close();
});

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