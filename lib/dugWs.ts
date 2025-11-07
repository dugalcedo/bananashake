import { WebSocket, WebSocketServer, type ServerOptions } from 'ws'

export type Message = {
    message: string
    error?: boolean
    data?: Record<string, any>
}

export type Handler = (ctx: Context) => Message | Promise<Message>;

export type Room = {
    id: string
    lastActivity: number
    clients: Set<WebSocket>
    createdAt: number
}

export type Data = Record<string, any> & {
    roomId?: string
}

export type Context = {
    data: Data
}

export class DugWebSocketServer extends WebSocketServer {
    #router = new Map<string, Handler>
    #rooms = new Map<string, Room>()
    #usedRoomIds = new Set<string>()
    #maxInactivityMs = 1000*60*15;
    #checkForInactivesInterval = 1000*60*1;

    constructor(options?: ServerOptions) {
        super(options)

        this.on('connection', (ws) => {
            this.#handleConnection(ws)
        })

        setInterval(() => {
            this.#checkForInactiveRooms()
        }, this.#checkForInactivesInterval);
    }

    // ---- public methods ---

    route(action: string, handler: Handler) {
        if (this.#router.has(action)) {
            throw new DWSSError(`Route "${action}" has already been defined.`)
        }

        this.#router.set(action, handler)
    }

    getStats(roomId?: string) {
        let room: Room | undefined;

        if (roomId) {
            room = this.#rooms.get(roomId)
        }

        return {
            rooms: this.#rooms.size,
            usedRoomIds: this.#usedRoomIds.size,
            roomStats: {
                roomId,
                roomSize: room?.clients?.size
            }
        }
    }

    // ---- private methods ---

    #handleConnection(ws: WebSocket) {
        ws.on('message', async dataPre => {
            const data = DugWebSocketServer.safeJsonParse(dataPre.toString())
            console.log("data.roomId:", data.roomId)
            const room = this.#getOrCreateRoom(ws, data.roomId)
            await this.#handleMessage(ws, data, room)
        })

        ws.on('error', (err) => {
            this.#handleError(ws, err)
        })
    }

    async #handleMessage(ws: WebSocket, data: Data, room: Room) {
        try {            
            if (!data.action) {
                throw { mesage: "missing action" }
            }

            const handler = this.#router.get(data.action)

            if (!handler) {
                throw { message: "invalid action" }
            }

            try {
                const message = await handler({
                    data
                })

                this.#broadcastToRoom(ws, room, JSON.stringify({
                    ...message,
                    roomId: room.id,
                    roomSize: room.clients.size
                }))
            } catch (error) {
                throw { message: (error as any)?.message }
            }
        } catch (error) {
            this.#broadcastToRoom(ws, room, JSON.stringify({
                error: true,
                message: (error as any)?.message,
                roomId: room.id,
                roomSize: room.clients.size
            }))
        }
    }

    #handleError(ws: WebSocket, err: Error) {
        ws.send(JSON.stringify({
            error: true,
            message: err?.message || "error"
        }))
    }

    #genRoomId(attempts = 0): string {
        if (attempts > 1000) return "ABCD";
        const chars = DugWebSocketServer.idChars
        const id = Array.from({ length: 4 }).map(_ => chars[Math.floor(Math.random()*chars.length)]).join('');
        if (this.#usedRoomIds.has(id)) return this.#genRoomId(attempts+1);
        this.#usedRoomIds.add(id)
        return id
    }

    // --- room logic ---

    #closeRoom(id: string) {
        const room = this.#rooms.get(id)
        if (!room) return
        for (const client of room.clients) {
            client.close()
        }
        this.#rooms.delete(id)
    }

    #getOrCreateRoom(ws: WebSocket, id?: string) {
        if (id) {
            const room = this.#rooms.get(id)
            if (room) {
                this.#cleanRoom(id)
                room.lastActivity = performance.now()
                room.clients.add(ws)
                return room
            }
        }

        const newRoom: Room = {
            id: this.#genRoomId(),
            lastActivity: performance.now(),
            clients: new Set([ws]),
            createdAt: performance.now()
        }

        this.#rooms.set(newRoom.id, newRoom)

        return newRoom
    }

    #cleanRoom(id: string) {
        const room = this.#rooms.get(id)
        if (!room) return
        for (const client of room.clients) {
            if (client.readyState !== WebSocket.CLOSED) {
                room.clients.delete(client)
            }
        }
    }

    #broadcastToRoom(ws: WebSocket, room: Room, str: string) {
        ws.send(str)
        for (const client of room.clients) {
            if (client === ws) continue;
            client.send(str)
        }
    }

    #checkForInactiveRooms() {
        const now = performance.now()
        const toDelete = new Set<string>()

        // Find inactives
        for (const [id, room] of this.#rooms) {
            const diff = now - room.lastActivity;
            if (diff > this.#maxInactivityMs) {
                toDelete.add(id)
            }
        }

        // Delete inactives
        for (const id of toDelete) {
            this.#closeRoom(id)
        }
    }

    // ---- static ---
    static idChars = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890"
    static safeJsonParse = (str: string): Data => {
        try {
            const json = JSON.parse(str)
            return json || {};
        } catch {
            return {}
        }
    }
}

export class DWSSError extends Error {
    name = "DugWebSocketError"
    constructor(msg: string) {super(msg)}
}