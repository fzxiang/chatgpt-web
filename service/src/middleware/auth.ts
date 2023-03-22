import fetch from 'node-fetch'
import { isNotEmptyString } from '../utils/is'

interface Responese {
  status: 'Success' | 'Fail'
  message: string
}
const auth = async (req, res, next) => {
  const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
  const SSO_PROXY = process.env.SSO_PROXY
  if (isNotEmptyString(AUTH_SECRET_KEY)) {
    try {
      const Authorization = req.header('Authorization')
      // if (!Authorization || Authorization.replace('Bearer ', '').trim() !== AUTH_SECRET_KEY.trim())
      //   throw new Error('Error: 无访问权限 | No access rights')
      if (SSO_PROXY) {
        const responese = await fetch(`${SSO_PROXY}/api/check` + `?token=${Authorization}`)
        const checkAuth = await responese.json() as Responese
        if (checkAuth?.status !== 'Success')
          throw new Error(`Error: 无访问权限 | ${checkAuth?.message}`)
      }
      next()
    }
    catch (error) {
      res.send({ status: 'Unauthorized', message: error.message ?? 'Please authenticate.', data: null })
    }
  }
  else {
    next()
  }
}

export { auth }
