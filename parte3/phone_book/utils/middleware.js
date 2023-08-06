const logger = require('./logger')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

// este podra ejecutarse solo si nunguna ruta atiende la peticion entrante (unknownEndPoint)
const myDefaultMiddleware = (request,response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}


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

module.exports = {
  requestLogger,
  //   unknownEndpoint,
  myDefaultMiddleware,
  errorHandler
}