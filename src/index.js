const express = require('express')
const flash = require('connect-flash')
const session = require('express-session')
const bodyParser = require('body-parser')
require('./db/mongoose')
const path = require('path')
const hbs = require('hbs')
require('./utils/handlebars')
const userRouter = require('./routers/user')
const postRouter = require('./routers/post')
const categoryRouter = require('./routers/category')

const app = express()
const port = process.env.PORT || 3000

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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json())

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  }))
app.use(flash());
app.use(function(req, res, next){
    res.locals.success = req.flash('success');
    res.locals.errors = req.flash('error');
    next();
});

app.use(userRouter)
app.use(postRouter)
app.use(categoryRouter)

app.get('/', (req, res) => {
    res.redirect(301, '/login')
})

app.get('*', (req, res) => {
    res.status(404).render('404', {
        pageTitle: '404 Page Not Found'
    })
})  

app.listen(port, () => {
    console.log('Server up and running on port ' + port)
})