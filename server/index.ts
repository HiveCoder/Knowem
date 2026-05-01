import cors from 'cors'
import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { GameEngine } from './gameEngine.js'
import { registerSocketHandlers } from './socketHandlers.js'

const app = express()
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : []
const corsOrigin = allowedOrigins.length > 0 ? allowedOrigins : true

app.use(cors({ origin: corsOrigin, credentials: true }))
app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    credentials: true,
  },
})

const engine = new GameEngine()
registerSocketHandlers(io, engine)

const port = Number(process.env.PORT || 3000)
httpServer.listen(port, () => {
  console.log(`Knowem server listening on http://localhost:${port}`)
})
