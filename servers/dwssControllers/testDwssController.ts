import { type DugWebSocketServer } from "../../lib/dugWs.js";

export default function testDwssController(dwss: DugWebSocketServer) {

    // test
    dwss.route('test', _ => {
        return { message: "the web socket sever is working" }
    })

    dwss.route('test/stats', c => {
        return {
            message: "stats retrieved",
            data: dwss.getStats(c.data.roomId)
        }
    })

    dwss.route('test/pokemon', async c => {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${Math.floor(Math.random()*649) + 1}`)
        const p = await res.json()
        return {
            message: "pokémon retreived",
            data: {
                name: p.name,
                sprite: p.sprites?.front_default
            }
        }
    })

}