import { Router } from "express";
import handle from "../expressHandler.js";
import Player from "../../database/models/Player.js";
import { 
    type CreatePlayerSchema, 
    createPlayerSchema 
} from "../expressValidators.js";

const playerRouter = Router()

// Create player
playerRouter.post("/", handle<CreatePlayerSchema>(async (ctx) => {

    const newPlayer = await Player.create({
        name: ctx.body.name
    })

    return {
        message: "player created",
        status: 201,
        data: newPlayer.dataValues
    }

}, { schema: createPlayerSchema }))

export default playerRouter