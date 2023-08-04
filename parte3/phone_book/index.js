const express = require("express")
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
    ].join(' ');
  });

app.use(morgan(':type'))

const myMiddlewareLogguer = (request,response,next) => {
    console.log("Method: ",request.method)
    console.log("Path: ",request.path)
    console.log("Body: ",request.body)
    
    next()
}
// este podra ejecutarse solo si nunguna ruta atiende la peticion entrante (unknownEndPoint)
const myDefaultMiddleware = (request,response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

// los middleware se ejecutan preferentemente antes de las rutas es lo primero y en el orden q se los llama
// app.use(myMiddlewareLogguer)


let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
]

function getRandomInt(max = 5000) {
    return Math.floor(Math.random() * max);
}

app.get('/api/persons', (request, response) => {
    response.json(persons)
})
app.get('/info', (request, response) => {
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
    options.timeZone = 'UTC';
    options.timeZoneName = 'short';
    let date = new Date();

    const html =  `<h1>PhoneBook has info for ${persons.length} people</h1>
                    <br/>
                    <h4>${ date.toLocaleDateString(undefined, options) } ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}</h4>`

    response.send(html)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    }else{
        response.status(404).end()
    }
})
app.delete('/api/persons/:id',(request,response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})
app.post('/api/persons',(request,response) => {
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

    if ( persons.filter(p => p.name === body.name).length > 0) {
        return response.status(400).json({ 
          error: 'name must be unique' 
        })
    }

    const person = {
      name: body.name,
      number: body.number || '',
      id: getRandomInt(),
    }
  
    persons = persons.concat(person)
  
    console.log(person);

    response.json(person)
})

app.use(myDefaultMiddleware)

/* 
    me quede en la parte 3 de node, inciso (b) Implementación de la aplicación en Internet
*/
const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)