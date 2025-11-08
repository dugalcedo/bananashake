import { server, dwss } from './servers/webSocketServer.js'
import expressApp from './servers/express.js'
import { connect } from './database/database.js'
import { PORT } from './env.js'

// controllers
import testDwssController from './servers/dwssControllers/testDwssController.js'
import playerRouter from './servers/expressControllers/playerControllers.js'
import gameRouter from './servers/expressControllers/gameControllers.js'

startServer()

async function startServer() {
    const success = await connect()

    if (!success) {
        expressApp.use((_, res) => {
            res.status(503)
            res.json({
                message: "Database down."
            })
        })
        return
    }

    // Express routers
    expressApp.use("/player", playerRouter)
    expressApp.use("/game", gameRouter)


    // DWSS routers
    testDwssController(dwss)

    server.listen(PORT, () => {
        console.log(`Now listening on port ${PORT}`)
    })
}
