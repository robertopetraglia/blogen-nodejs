const express = require('express')
const flash = require('connect-flash')
const session = require('express-session')
const bodyParser = require('body-parser')
require('./db/mongoose')
const path = require('path')
const hbs = require('hbs')
const userRouter = require('./routers/user')
const auth = require('./middleware/auth')

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

app.get('/', (req, res) => {
    res.redirect(301, '/login')
})

app.get('*', (req, res) => {
    res.status(404).render('404', {
        title: '404 Page not found',
        errorMessage: 'Page not found'
    })
})

app.use(function(error, req, res, next) {
    res.status(401).render('login', { errorMessage: error.message });
  });
  

app.listen(port, () => {
    console.log('Server up and running on port ' + port)
})