const db = require('../config/db')
const {Sequelize} = require("sequelize")
const User = require('./user')

const Article = db.define(
    "Article",
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        title : {
            type: Sequelize.STRING,
            allowNull: false
        },
        description : {
            type: Sequelize.TEXT,
            allowNull: false
        },
        thumbnail : {
            type : Sequelize.STRING,
            allowNull: true
        },
        userId : {
            type : Sequelize.INTEGER,
            allowNull: false
        }
    }, 
    {
        tableName: "articles",
        underscored : true,
        timestamps : true 
    }
)

Article.belongsTo(User, {
    foreignKey: "userId",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
})

User.hasMany(Article, {
    foreignKey: "userId",
    onUpdate: "CASCADE",
    onDelete: "RESTRICT"
})

module.exports = Article