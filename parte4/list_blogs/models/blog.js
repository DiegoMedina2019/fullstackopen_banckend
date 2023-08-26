const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const blogSchema = new mongoose.Schema({
  title: {
    type:String,
    minlength:5,
    required:true
  },
  author: String,
  url: {
    type:String,
    required:true
  },
  likes: {
    type: Number,
    default: 0
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})


blogSchema.plugin(uniqueValidator) // sirve para que se utilicen las validaciones en el update si es que se espesifica desde el PUT-> findByIdAndUpdate(id,obj,{ new:true,runValidators:true })

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Blog', blogSchema)