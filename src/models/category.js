const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

const categorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
})

categorySchema.statics.countCategories = async () => {
    return await Category.countDocuments({})
}

categorySchema.statics.getAllCategories = async () => {
    const categories = await Category.find({}).select('_id title')
    return categories
}

categorySchema.statics.getCategoryTitleById = async (category_id) => {
    const category = await Category.findOne({ _id: new ObjectId(category_id) })
    return category.title
}

const Category = mongoose.model('Category', categorySchema)

module.exports = Category