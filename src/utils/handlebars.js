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

hbs.registerHelper('categoryFormat', async function(category_id) {
    const catTitle   = await Category.getCategoryTitleById(category_id)
    console.log('title: ', catTitle)
    return catTitle
})