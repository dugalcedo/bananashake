import * as z from 'zod'

export const createPlayerSchema = z.object({
    name: z.string().lowercase().trim().min(3).max(50)
})

export type CreatePlayerSchema = z.infer<typeof createPlayerSchema>;

export const createGameSchema = z.object({
    displayName: z.string().lowercase().trim().min(3).max(50),
    gameName: z.string().lowercase().trim().min(3).max(50)
})

export type CreateGameSchema = z.infer<typeof createGameSchema>

export const joinGameSchema = z.object({
    displayName: z.string().lowercase().trim().min(3).max(50),
    uuid: z.uuidv4()
})

export type JoinGameSchema = z.infer<typeof joinGameSchema>