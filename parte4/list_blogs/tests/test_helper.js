const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: 'HTML is easy',
    author: 'PEPE',
    url: 'http://www.blogs.com',
    likes: 2
  },
  {
    title: 'Browser can execute only Javascript',
    author: 'DEVS',
    url: 'http://www.js-devs.com',
    likes: 1
  },
]

const nonExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon', author: 'cualquiera',url:'url.com',likes:2 })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb
}