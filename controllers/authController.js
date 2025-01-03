const User = require("../models/user");
const db = require("../config/db");
const { dataValid } = require("../utils/dataValidation");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');    

const register = async (req, res) => {
    const valid = {
        username: "required",
        password: "required",
        confirmPassword: "required",
        email: "required,isEmail",
        name: "required",
    };

    const user = await dataValid(valid, req.body);

    try {
        

        if (user.data.password !== user.data.confirmPassword) {
            user.message.push("Password tidak sama");
        }

        if (user.message.length > 0) {
            return res.status(400).json({
                message: user.message,
            });
        }

        const usernameExist = await User.findAll({
            where: {
                username: user.data.username,
            },
        });

        const emailExist = await User.findAll({
            where: {
                email: user.data.email,
            },
        });

        if (usernameExist.length > 0) {
            return res.status(400).json({
                message: "Username telah digunakan",
            });
        }

        if (emailExist.length > 0) {
            return res.status(400).json({
                message: "Email telah digunakan",
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(user.data.password, saltRounds);

    
        user.data.password = hashedPassword;
        delete user.data.confirmPassword; 

        const newUser = await User.create(user.data);

        return res.status(201).json({
            message: "success",
            data: newUser,
        });
    } catch (error) {
        console.log("Error di register", error);
    }
};

const login = async (req, res) => {
    const valid = {
        username: "required",
        password: "required",
    };

    try {
        const userValidation = await dataValid(valid, req.body);

        if (userValidation.message.length > 0) {
            return res.status(400).json({
                message: userValidation.message,
            });
        }

        const { username, password } = userValidation.data;

        const user = await User.findOne({
            where: { username },
        });

        if (!user) {
            return res.status(404).json({
                message: "User tidak ditemukan",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Password salah",
            });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username }, 
            process.env.JWT_SECRET,                 
            { expiresIn: '1h' }                    
        );

        return res.status(200).json({
            message: "Login berhasil",
            token,
        });
    } catch (error) {
        console.error("Error di login", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

module.exports = { register, login };