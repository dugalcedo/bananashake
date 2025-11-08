import { Router } from "express";
import handle from "../expressHandler.js";
import Game from "../../database/models/Game.js";
import Player from "../../database/models/Player.js"
import TOKEN from "../token.js";
import { createGameSchema, joinGameSchema, JoinGameSchema, type CreateGameSchema } from "../expressValidators.js";
import { v4 } from "uuid";

const gameRouter = Router()

// Create game
gameRouter.post("/", handle<CreateGameSchema>(async (ctx) => {

    const newGame = await Game.create({
        name: ctx.body.gameName,
        uuid: v4()
    })

    const newPlayer = await Player.create({
        name: ctx.body.displayName,
        game: newGame.dataValues.id
    })

    const tokenPayload = {
        gameId: newGame.dataValues.id,
        playerId: newPlayer.dataValues.id
    }

    return {
        message: "game created",
        token: TOKEN.stringify(tokenPayload),
        uuid: newGame.dataValues.uuid
    }

}, { schema: createGameSchema }))

// Join game
gameRouter.post("/", handle<JoinGameSchema>(async (ctx) => {

    const game = await Game.findOne({
        where: { uuid: ctx.body.uuid }
    })

    if (!game) throw {
        status: 404,
        message: "Game not found"
    }

    let player /* Existing */ = await Player.findOne({
        where: { 
            name: ctx.body.displayName,
            game: game.dataValues.id
        }
    }) 

    if (!player) {
        player = await Player.create({
            name: ctx.body.displayName,
            game: game.dataValues.id
        })
    }

    const tokenPayload = {
        gameId: game.dataValues.id,
        playerId: player.dataValues.id
    }

    return {
        message: "game joined",
        token: TOKEN.stringify(tokenPayload),
        uuid: game.dataValues.uuid
    }

}, { schema: joinGameSchema }))

export default gameRouter