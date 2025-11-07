import { DataTypes as DT } from "sequelize";
import { db } from "../database.js";

const Player = db.define(
    "player",
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
        },
        game: {
            type: DT.INTEGER,
            references: 'game',
            allowNull: false
        },
        isHost: {
            type: DT.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },
    {
        tableName: 'players',
        modelName: 'player'
    }
)

export default Player