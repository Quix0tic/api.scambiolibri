import * as Sequelize from 'sequelize'
import * as debug from 'debug'

export interface UserAttribute {
    name: string
    number: string
    encrypted_password: string
    salt: string
    city: string
    created_at: Date
}
export interface AnnouncementAttribute {
    title: string
    isbn: string
    subject: string
    edition: string
    grade: string
    notes: string
    price: number
    phone: string
    city: string
}
export interface StorageConfiguration {
    database?: string
    username?: string
    password?: string
    host?: string
    dialect: string
    storage?: string
    logging?: (err: string) => any
}

export interface UserInstance extends Sequelize.Instance<UserAttribute> { }
export interface AnnouncementInstance extends Sequelize.Instance<AnnouncementAttribute> { }

export interface UserModel extends Sequelize.Model<UserInstance, UserAttribute> { }
export interface AnnouncementModel extends Sequelize.Model<AnnouncementInstance, AnnouncementAttribute> { }

export class SequelizeDatabase {
    public db: Sequelize.Sequelize
    public User: UserModel
    public Announcement: AnnouncementModel
    private config: StorageConfiguration
    private _error: debug.IDebugger

    constructor(config: StorageConfiguration) {
        this.config = config
        this.db = new Sequelize(
            this.config.database ? this.config.database : 'database', //se esiste: config.database o 'database' 
            this.config.username ? this.config.username : 'username', //se esiste: config.username o 'username' 
            this.config.password ? this.config.password : 'password',//se esiste: config.password o 'password' 
            this.config)
        this.User = this.db.define<UserInstance, UserAttribute>('User', {
            uuid: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            number: {
                type: Sequelize.STRING,
                allowNull: false
            },
            encrypted_password: {
                type: Sequelize.STRING,
                allowNull: false
            },
            salt: {
                type: Sequelize.STRING,
                allowNull: false
            },
            city: {
                type: Sequelize.STRING,
                allowNull: false
            }
        }, {
                tableName: 'users'
            })
        this.Announcement = this.db.define<AnnouncementInstance, AnnouncementAttribute>('Announcement', {
            uuid: {
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false
            },
            isbn: {
                type: Sequelize.STRING(13),
                allowNull: false
            },
            subject: {
                type: Sequelize.STRING,
                allowNull: false
            },
            edition: {
                type: Sequelize.STRING(4),
                allowNull: false
            },
            grade: {
                type: Sequelize.STRING,
                allowNull: false
            },
            notes: {
                type: Sequelize.STRING,
                allowNull: false
            },
            price: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            phone: {
                type: Sequelize.STRING(10),
                allowNull: false
            },
            city: {
                type: Sequelize.STRING,
                allowNull: false
            }
        }, {
                tableName: 'announcements'
            })
    }

    private _connect = async () => {
        try {
            await this.db.authenticate()
        } catch (error) {
        }
    }
    private _init = async () => {
        try {
            await this.db.sync({ force: false })
        } catch (error) {

            return process.exit(1)
        }
    }

    public start = async () => {
        await this._connect()
        await this._init()
    }
}
