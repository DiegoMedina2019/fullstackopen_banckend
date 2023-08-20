const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})
  const BlogObjects = helper.initialBlogs.map( blog => new Blog(blog))
  const promiseArray = BlogObjects.map( blog => blog.save())
  // nota: usar eso hace ejecutar las promesas de forma paralela.
  await Promise.all(promiseArray)
  // Por lo que si quiero que se ejecuten en orden deveria usar un for .. of
  // for (let blog of helper.initialBlogs) {
  //   let blogObject = new Blog(blog)
  //   await blogObject.save()
  // }
})


test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('a blog must have an id', async () => {
  const blogAtStart = await helper.blogsInDb()

  const blog = blogAtStart[0]

  const processedBlog = JSON.parse(JSON.stringify(blog))

  expect(processedBlog).toBeDefined()
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('a specific blog is within the returned blogs', async () => {
  const response = await api.get('/api/blogs')

  const titles = response.body.map(r => r.title)
  expect(titles).toContain(
    'Browser can execute only Javascript'
  )
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'async/await simplifies making async calls',
    author: 'DiegoSM',
    url: 'http://www.async-await.com',
    likes: 6
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const contents = blogsAtEnd.map(r => r.title)
  expect(contents).toContain('async/await simplifies making async calls')

})

test('if the likes property is missing, its default value is 0', async () => {
  const newBlog = {
    title: 'algun titulo',
    author: 'autorX',
    url: 'http://www.sinLikes.com'
  }

  const { body } = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  // console.log(body)
  const processedBlog = body

  expect(processedBlog.likes).toBe(0)
})

test('blog without title or url is not added', async () => {
  const newblog = {
    // title:'algun titulo',
    author: 'DiegoSM',
    url: 'http://www.async-await.com',
    likes: 6
  }

  await api
    .post('/api/blogs')
    .send(newblog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

test('a specific blog can be viewed', async () => {
  const blogAtStart = await helper.blogsInDb()

  const blogToView = blogAtStart[0]

  const resultBlog = await api
    .get(`/api/blogs/${blogToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const processedBlogToView = JSON.parse(JSON.stringify(blogToView))

  expect(resultBlog.body).toEqual(processedBlogToView)
})

test('a blog can be deleted', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd).toHaveLength(
    helper.initialBlogs.length - 1
  )

  const titles = blogsAtEnd.map(r => r.title)

  expect(titles).not.toContain(blogToDelete.title)
})

afterAll( () => {
  mongoose.connection.close()
})