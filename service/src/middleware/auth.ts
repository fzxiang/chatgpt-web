import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import { isNotEmptyString } from '../utils/is'
const PRIVATE_KEY = process.env.PRIVATE_KEY || 'secret'

const auth = async (req, res, next) => {
  const AUTH_OPEN = process.env.AUTH_OPEN
  if (isNotEmptyString(AUTH_OPEN)) {
    try {
      const Authorization = req.header('Authorization')
      await jwt.verify(Authorization, PRIVATE_KEY)
      next()
    }
    catch (error) {
      res.status(StatusCodes.UNAUTHORIZED)
        .send({ status: 'Unauthorized', message: error.message ?? 'Please authenticate.', data: null })
    }
  }
  else {
    next()
  }
}

export { auth }
