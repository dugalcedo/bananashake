import dotenv from 'dotenv'; dotenv.config();

class EnvVarError extends Error {
    name = "EnvVarError"

    constructor(key: string, message: string = "missing environment variable") {
        super(`${message} [${key}]`)
    }
}

// ENV
if (!process.env.ENV) throw new EnvVarError("ENV")
if (!['DEV', 'PROD'].includes(process.env.ENV)) throw new EnvVarError('ENV', 'environment variable can only be "DEV" or "PROD"')
export const ENV = process.env.ENV

// PORT
if (!process.env.PORT) throw new EnvVarError("PORT")
if (Number(process.env.PORT) < 1024) throw new EnvVarError("PORT", 'must be a number of at least 1024')
export const PORT = process.env.PORT

// JWT_SECRET
if (!process.env.JWT_SECRET) throw new EnvVarError("JWT_SECRET")
export const JWT_SECRET = process.env.JWT_SECRET