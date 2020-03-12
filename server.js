const express = require('express')
const cors = require('cors')
const ex = express()
const port = process.env.PORT || 3000

ex.use(cors())
ex.use(express.json())

const ue = require('./engine.js')

ex.use('/', express.static('page'))

// ex.get('/', (req, res) => {
//     res.send('Utopia Engine')
// })

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

function handleApiCall ( body ) {
    if ( body.action == "getState" ) {
        return {result: true, state: ue.data, req: body}
    }

    return ue.doAction( body.action, body.params )

}