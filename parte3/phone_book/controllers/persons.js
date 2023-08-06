const personRouter = require('express').Router()
const Person = require('../models/person')

personRouter.get('/', (request, response,next) => {
  Person.find({}).maxTimeMS(20000).then(personas => {
    response.json(personas)
  })
    .catch(error => next(error))
})
personRouter.get('/info', (request, response,next) => {
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

personRouter.get('/:id', (request, response, next) => {

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
personRouter.delete('/:id',(request,response, next) => {

  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      console.log('DELETE PERSON: ',result)
      response.status(204).end()
    })
    .catch(error => next(error))

})
personRouter.post('/',(request,response,next) => {
  const body = request.body

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

})

personRouter.put('/:id', (request,response,next) => {
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


module.exports = personRouter