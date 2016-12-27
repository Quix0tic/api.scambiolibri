"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const Sequelize = require("sequelize");
class SequelizeDatabase {
    constructor(config) {
        this._connect = () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db.authenticate();
            }
            catch (error) {
            }
        });
        this._init = () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.db.sync({ force: false });
            }
            catch (error) {
                return process.exit(1);
            }
        });
        this.start = () => __awaiter(this, void 0, void 0, function* () {
            yield this._connect();
            yield this._init();
        });
        this.config = config;
        this.db = new Sequelize(this.config.database ? this.config.database : 'database', //se esiste: config.database o 'database' 
        this.config.username ? this.config.username : 'username', //se esiste: config.username o 'username' 
        this.config.password ? this.config.password : 'password', //se esiste: config.password o 'password' 
        this.config);
        this.User = this.db.define('User', {
            uuid: {
                type: Sequelize.STRING,
                allowNull: false
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
            },
            created_at: {
                type: Sequelize.STRING,
                allowNull: false
            }
        }, {
            tableName: 'users'
        });
        this.Announcement = this.db.define('Announcement', {
            uuid: {
                type: Sequelize.STRING,
                allowNull: false
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
            },
            created_at: {
                type: Sequelize.NOW,
                allowNull: false
            }
        }, {
            tableName: 'announcements'
        });
    }
}
exports.SequelizeDatabase = SequelizeDatabase;
//# sourceMappingURL=models.js.map