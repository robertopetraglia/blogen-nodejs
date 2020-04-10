const hbs = require('hbs')
const moment = require('moment')
const Category = require('../models/category')

hbs.registerHelper('dateFormat', function(date, format) {
    const mmntDate = moment(date).utc().format(format)
    return mmntDate
})

hbs.registerHelper('loopCounter', function(value) {
    return parseInt(value) + 1
})

hbs.registerHelper('gt', function(a, b) {
    return (a > b);
});

hbs.registerHelper('eq', function(a, b) { 
    return (a == b);
});