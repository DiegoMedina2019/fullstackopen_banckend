const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7)
  }else{
    request.token = null
  }

  next()
}

const userExtractor = async (request, response, next) => {
  const token = request.token
  const decodedToken = jwt.verify(token, process.env.SECRET)
  // console.log(decodedToken)
  if (!token || !decodedToken.id ) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }if (decodedToken.exp && new Date() > new Date(decodedToken.exp * 1000)) {
    return response.status(401).json({ error: 'token expired' })
  }
  request.user = await User.findById(decodedToken.id)

  next()
}

// este podra ejecutarse solo si nunguna ruta atiende la peticion entrante (unknownEndPoint)
const unknownEndpoint = (request,response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}


// creo otro middleware para controlar errores espesificos si lo deseo
const errorHandler = (error, request, response, next) => {

  // console.error(error.name)
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
  if (error.name ===  'JsonWebTokenError') {
    return response.status(401).json({ error: error.message })
  }
  if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    })
  }

  next(error) // lo demas errores pasa el default middleware de errores de express
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}