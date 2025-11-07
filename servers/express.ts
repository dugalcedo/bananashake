import express from 'express'
import cors from 'cors'

const expressApp = express()

expressApp.use(cors())
expressApp.use(express.json({ type: '*/*' }))

export default expressApp