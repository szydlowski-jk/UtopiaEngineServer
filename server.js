const express = require('express')
const cors = require('cors')
const ex = express()
const port = process.env.PORT || 3000

ex.use(cors())

const ue = require('./engine.js')

ex.use('/', express.static('page'))

// ex.get('/', (req, res) => {
//     res.send('Utopia Engine')
// })



ex.get('/ue', (req, res) => {
    res.send(JSON.stringify(ue.data))
})

ex.post('/API', (req, res) => {
    console.log(req.body)
    res.send(ue.getActions())
})

ex.get('/API', (req, res) => {
    console.log(req.body)
    res.send(ue.getActions())
})

ex.listen(port, () => {
    console.log(`listening on port ${port}`)
})
