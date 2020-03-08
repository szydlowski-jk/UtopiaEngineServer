const express = require('express')
const ex = express()
const port = process.env.PORT

const ue = require('./engine.js')

ex.get('/', (req, res) => {
    res.send(req)
})

ex.get('/ue', (req, res) => {
    res.send(JSON.stringify(ue.data))
})

ex.listen(port, () => {
    console.log(`listening on port ${port}`)
})
