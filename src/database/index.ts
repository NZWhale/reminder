import { Sequelize, DataTypes } from 'sequelize'
import { PoolConfig as PgConfig } from 'pg';


export default class Database {
    private sequelize: Sequelize

    constructor(private dbConfig: PgConfig) {
        const { user, password, host, port, database } = this.dbConfig
        this.sequelize = new Sequelize(`postgres://${user}:${password}@${host}:${port}/${database}`)
        this.sync()
    }



    async isUserExist(userId: number): Promise<boolean> {
        if (userId) {
            return false
        }
        return true
    }

    private sync() {
        const User = this.sequelize.define('User', {
            // Model attributes are defined here
            firstName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            lastName: {
                type: DataTypes.STRING
                // allowNull defaults to true
            }
        }, {
            // Other model options go here
        });

        // `sequelize.define` also returns the model
        console.log(User === this.sequelize.models.User);
    }
}