import { Sequelize } from 'sequelize'
import { ENV } from '../env.js'

export const db = new Sequelize({
    dialect: 'sqlite',
    storage: `database/database_${ENV}.sqlite`
})

export async function connect() {
    try {
        await db.sync()
        console.log("Connected to database.")
        return true
    } catch (error) {
        console.error("Failed connecting to database.")
        console.error(error)
        return false
    }
}
