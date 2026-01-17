const express = require('express')
const router = require('./src/routes/routes')
require('dotenv').config()
const PORT = process.env.PORT || 3000


const app = express()

app.get('/', (req, res) => {
    res.send('Hello World')
})


// Main Router
app.use("/api", router)

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000')
})



module.exports = {app}