import { DataTypes as DT } from "sequelize";
import { db } from "../database.js";

const Game = db.define(
    "game",
    {
        id: {
            type: DT.INTEGER,
            allowNull: false,
            autoIncrement: true,
            unique: true,
            primaryKey: true
        },
        name: {
            type: DT.TEXT,
            allowNull: false,
            validate: {
                len: [3, 50]
            }
        },
        data: {
            type: DT.TEXT,
            allowNull: false,
            defaultValue: "{}",
            validate: {
                len: [2, 5000]
            }
        }
    },
    {
        tableName: 'games',
        modelName: 'game'
    }
)

export default Game