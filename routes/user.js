const express = require('express');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config');
const { signupValidation, verifyAtomicity, signinValidation, authMiddleware, updateInputValidation } = require('../middlewares/userMiddlewares');
const { User, Account } = require('../db');
const userRouter = express.Router();

userRouter.post("/signup", signupValidation, verifyAtomicity, async (req, res) => {
    const body = req.body;
    const balance = Math.floor(Math.random() * 10000) + 1;

    try{
        const user = await User.create(body);
        const account = await Account.create({
            userId: user._id,
            balance: balance
        });

        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);
        
        res.status(200).json({
            message: "User created successfully",
            token: token
        });
    } catch(error){
        console.log(error);

        res.status(500).json({
            msg: error.message
        });
    }
});

userRouter.post("/signin", signinValidation, async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try{
        const user = await User.findOne({
            username: username,
            password: password
        });
    
        if(!user){
            res.status(411).json({
                message: "Error while logging in"
            });
            return;
        }
        const token = jwt.sign({
            username: username
        }, JWT_SECRET);
        res.status(200).json({
            token: token
        });
    } catch(error){
        console.log(error);
        res.status(500).json({
            msg: error.message
        });
    }
});

userRouter.post("/update", updateInputValidation, authMiddleware, async (req, res) => {
    const token = req.headers.authorization.split(" ")[1];

    try{
        const decoded = jwt.verify(token, JWT_SECRET);

        const username = decoded.username;

        const updatedUser = await User.findOneAndUpdate({
            username: username
        }, req.body);

        if(updatedUser){
            return res.status(200).json({
                message: "Updated successfully"
            });
        }
        else{
            return res.status(411).json({
                message: "Error while updating information"
            });
        }
    } catch(error){
        console.log(error);
        res.status(500).json({
            msg: error.message
        });
    }
});

userRouter.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    try{

        const users = await User.find({
            $or: [{
                firstName: {
                    "$regex": filter
                }
            }, {
                lastName: {
                    "$regex": filter
                }
            }]
        });
    
        res.json({
            user: users.map(user => ({
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                _id: user._id
            }))
        });
    } catch(error){
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
});


module.exports = userRouter;