const blogRouter = require('express').Router()
const Blog = require('../models/blog')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogRouter.post('/', async (request, response, next) => {
  const { title, author, url, likes } = request.body

  const blog = new Blog({
    title,
    author,
    url,
    likes: likes || 0 // Establecer likes como 0 si está ausente en la solicitud
  })

  const result = await blog.save()
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

blogRouter.delete('/:id', async (request, response, next) => {
  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

blogRouter.put('/:id', async (request, response, next) => {
  const { likes } = request.body

  const result = await Blog.findByIdAndUpdate(request.params.id,{
    likes: likes || 0 // Establecer likes como 0 si está ausente en la solicitud
  }, { new:true })

  response.json(result)

})

module.exports = blogRouter