const express = require('express')
const ex = express()
const port = process.env.PORT

ex.get('/', (req, res) => {
    res.send('Hello Enigma')
})

ex.listen(port, () => {
    console.log(`listening on port ${port}`)
})
