const express = require('express')
require('./db/mongoose')
const path = require('path')
const hbs = require('hbs')
const userRouter = require('./routers/user')

const app = express()
const port = process.env.PORT

// Define paths for Express config
const publicDirPath = path.join(__dirname, '../public')
const viewPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

// Setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewPath)
hbs.registerPartials(partialsPath)

// Setup static directory to serve
app.use(express.static(publicDirPath))

app.use(express.json())
app.use(userRouter)

app.get('/', (req, res) => {
    res.render('index', {
        pageTitle: 'Blogen | Home'
    })
})

app.get('*', (req, res) => {
    res.status(404).render('404', {
        title: '404 Page not found',
        errorMessage: 'Page not found'
    })
})

app.listen(port, () => {
    console.log('Server up and running on port ' + port)
})