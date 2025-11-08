import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../env.js'

const stringify = (payload: jwt.JwtPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" })
}

const parse = (token: string): any => {
    try {
        const parsed = jwt.verify(token, JWT_SECRET, {
            ignoreExpiration: false
        })
        if (typeof parsed === 'string') throw null
        return parsed
    } catch {
        throw {
            status: 400,
            message: "Bad token"
        }
    }
}

const TOKEN = { stringify, parse }
export default TOKEN