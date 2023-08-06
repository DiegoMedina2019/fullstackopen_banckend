/* eslint-disable no-undef */
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('build'))

morgan.token('type', function(req, res) {
  return [
    req.method,
    req.url,
    res.statusCode,
    res.getHeader('content-length') || '-',
    res.responseTime + 'ms'
  ].join(' ')
})

app.use(morgan(':type'))

// const myMiddlewareLogguer = (request,response,next) => {
//   console.log('Method: ',request.method)
//   console.log('Path: ',request.path)
//   console.log('Body: ',request.body)

//   next()
// }

// los middleware se ejecutan preferentemente antes de las rutas es lo primero y en el orden q se los llama
// app.use(myMiddlewareLogguer)

const Person = require('./models/person')


// function getRandomInt(max = 5000) {
//   return Math.floor(Math.random() * max)
// }

app.get('/api/persons', (request, response,next) => {
  Person.find({}).maxTimeMS(20000).then(personas => {
    response.json(personas)
  })
    .catch(error => next(error))
})
app.get('/info', (request, response,next) => {
  var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  options.timeZone = 'UTC'
  options.timeZoneName = 'short'
  let date = new Date()

  Person.find({}).maxTimeMS(20000).then(personas => {
    const html =  `<h1>PhoneBook has info for ${personas.length} people</h1>
        <br/>
        <h4>${ date.toLocaleDateString(undefined, options) } ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}</h4>`

    response.send(html)
  })
    .catch(error => next(error))

})

app.get('/api/persons/:id', (request, response, next) => {

  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      }else{
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})
app.delete('/api/persons/:id',(request,response, next) => {

  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      console.log('DELETE PERSON: ',result)
      response.status(204).end()
    })
    .catch(error => next(error))

})
app.post('/api/persons',(request,response,next) => {
  const body = request.body
  console.log(body)

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  }
  if (!body.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  }

  const person = {
    name: body.name,
    number: body.number || '',
  }

  const p = new Person(person)

  p.save()
    .then(savedPerson => savedPerson.toJSON())
    .then(savedAndFormattedPerson => {
      response.json(savedAndFormattedPerson)
    })
    .catch(error => next(error))

  // Person.find({name:body.name}).maxTimeMS(20000).then(result => {
  //     console.log(result);
  //     if (result.length > 0) {
  //         return response.status(400).json({
  //             error: 'name must be unique'
  //         })
  //     }else{
  //         const person = {
  //             name: body.name,
  //             number: body.number || '',
  //         }

  //         const p = new Person(person)

  //         p.save()
  //             .then(savedPerson => savedPerson.toJSON())
  //             .then(savedAndFormattedPerson => {
  //                 response.json(savedAndFormattedPerson)
  //             })
  //             .catch(error => next(error))
  //     }
  // })
  // .catch(error => next(error))


})

app.put('/api/persons/:id', (request,response,next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number || '',
  }

  Person.findByIdAndUpdate(request.params.id, person, { new:true,runValidators:true })
    .then(updatePerson => {
      response.json(updatePerson)
    })
    .catch(error => next(error))
})


// este podra ejecutarse solo si nunguna ruta atiende la peticion entrante (unknownEndPoint)
const myDefaultMiddleware = (request,response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(myDefaultMiddleware)

// creo otro middleware para controlar errores espesificos si lo deseo
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  if (error.name === 'SyntaxError') {
    return response.status(400).send({ error: 'JSON malformatted' , msg: error.message })
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error) // lo demas errores pasa el default middleware de errores de express
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)