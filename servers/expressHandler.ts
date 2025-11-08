import { type RequestHandler, type Request, type Response, type NextFunction } from "express";
import * as z from "zod";

type Context<BodyT = any> = {
    req: Request
    res: Response
    next: NextFunction
    body: BodyT
}

type Result = Record<string, any> & {
    message: string
    status?: number
}

type Handler<BodyT = any> = (ctx: Context<BodyT>) => Result | Promise<Result>

type Options = {
    schema?: z.ZodObject
}

export default function handle<BodyT>(handler: Handler<BodyT>, options?: Options): RequestHandler {
    return async (req, res, next) => {
        console.log(`New request: ${req.method} ${req.url}`)
        let body: BodyT = req.body

        // body validation
        if (options?.schema) {
            options.schema.parse(body)
        }

        try {
            const result = await handler({ 
                req, 
                res, 
                next,
                body
            })
            res.status(result.status || 200)
            res.json({
                ...result,
                message: result.message
            })
        } catch (_error) {
            console.error(_error)
            const error = (_error || {}) as any
            res.status(error.status || 500)
            res.json({
                message: error.message || "Internal Server Error"
            })
        }
    }
}