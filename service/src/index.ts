import querystring from 'querystring'
import express from 'express'
import rp from 'request-promise'
import jwt from 'jsonwebtoken'
import type { ChatContext, ChatMessage } from './chatgpt'
import { chatConfig, chatReplyProcess, currentModel } from './chatgpt'
import { auth } from './middleware/auth'
import { limiter } from './middleware/limiter'

const app = express()
const router = express.Router()

const PRIVATE_KEY = process.env.PRIVATE_KEY || 'secret'
const AUTH_EXPIRE_TIME = process.env.AUTH_EXPIRE_TIME || '2h'

app.use(express.static('public'))
app.use(express.json())

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

router.post('/chat-process', [auth, limiter], async (req, res) => {
  res.setHeader('Content-type', 'application/octet-stream')

  try {
    const { prompt, options = {} } = req.body as { prompt: string; options?: ChatContext }
    let firstChunk = true
    await chatReplyProcess(prompt, options, (chat: ChatMessage) => {
      res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
      firstChunk = false
    })
  }
  catch (error) {
    res.write(JSON.stringify(error))
  }
  finally {
    res.end()
  }
})

router.post('/config', auth, async (req, res) => {
  try {
    const response = await chatConfig()
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})

router.post('/session', auth, async (req, res) => {
  try {
    const AUTH_OPEN = process.env.AUTH_OPEN
    const isOpen = AUTH_OPEN === String(true)
    res.send({ status: 'Success', message: '', data: { auth: isOpen, model: currentModel() } })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

let backUrl = ''

// 单点登录
router.get('/ssoLogin', async (req, res) => {
  try {
    const url = new URL(process.env.APP_SSO_URL)
    url.pathname = '/login'

    backUrl = (req.query.back || req.headers.referer) as string
    url.searchParams.set('url', backUrl as string)
    url.searchParams.set('service', `${req.protocol}://${req.headers.host}/checkTicket`)

    // const AUTH_OPEN = process.env.AUTH_OPEN
    // const isOpen = AUTH_OPEN === String(true)
    // if (!req.headers.authorization || req.headers.authorization !== '123') {
    //   res.status(StatusCodes.UNAUTHORIZED).send({})
    //   return
    // }
    res.redirect(url.href)
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

// 票据鉴证
router.get('/checkTicket', async (req, res) => {
  try {
    const ticket = req.query.ticket
    if (!ticket)
      throw new Error('Secret key is empty')

    const url = new URL(process.env.APP_SSO_URL)
    url.pathname = '/authTicket'
    url.searchParams.set('ticket', ticket as string)
    url.searchParams.set('format', 'json')
    const options = {
      uri: url.href,
      json: true,
    }
    const { serviceResponse } = await rp(options)
    const { authenticationSuccess: { attributes } } = serviceResponse

    const token = jwt.sign({
      id: attributes.id,
      name: attributes.name,
    }, PRIVATE_KEY, { expiresIn: AUTH_EXPIRE_TIME })
    const search = querystring.stringify({
      token,
      id: attributes.id,
      name: attributes.name,
      email: attributes.email,
      avatar: attributes.avatar,
    })

    res.redirect(`${backUrl}?${search}`)
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

// 账号密码校验
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body as { token: string }
    if (!token)
      throw new Error('Secret key is empty')

    if (token !== '这里是校验')
      throw new Error('密钥无效 | Secret key is invalid')

    res.send({ status: 'Success', message: 'Verify successfully', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

app.use('', router)
app.use('/api', router)

const PORT = process.env.APP_PORT || 8100
app.listen(PORT, () => globalThis.console.log(`Server is running on port ${PORT}`))
