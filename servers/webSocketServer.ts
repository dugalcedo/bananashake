import expressApp from "./express.js";
import { createServer } from "http";
import { DugWebSocketServer } from "../lib/dugWs.js";

export const server = createServer(expressApp)
export const dwss = new DugWebSocketServer({ server })
