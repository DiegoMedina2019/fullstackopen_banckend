const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const { userExtractor } = require('../utils/middleware')

blogRouter.get('/', async (request, response) => {
  // optiene todos los blogs y si alguno tiene usuarios los abjunta pero con las propiedades mencionadas username y name solamente
  const blogs = await Blog.find({}).populate('user',{ username:1,name:1 })
  response.json(blogs)
})

blogRouter.post('/',userExtractor, async (request, response, next) => {
  const { title, author, url, likes } = request.body
  // const user = await User.findById(request.body.userId)

  const user = request.user

  const blog = new Blog({
    title,
    author,
    url,
    likes: likes || 0, // Establecer likes como 0 si está ausente en la solicitud
    user: user.id
  })

  const result = await blog.save()

  user.blogs = user.blogs.concat(result.id)
  await user.save()

  response.json(result)

})

blogRouter.get('/:id', async (request, response, next) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogRouter.delete('/:id',userExtractor, async (request, response, next) => {

  const user = request.user

  const blog = await Blog.findById(request.params.id)

  if (blog.user.toString() === user.id.toString()) {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  }else{
    return response.status(401).json({ error: 'the blog does not belong to the user' })
  }

})

blogRouter.put('/:id', async (request, response, next) => {
  const { likes } = request.body

  const result = await Blog.findByIdAndUpdate(request.params.id,{
    likes: likes || 0 // Establecer likes como 0 si está ausente en la solicitud
  }, { new:true })

  response.json(result)

})

module.exports = blogRouter