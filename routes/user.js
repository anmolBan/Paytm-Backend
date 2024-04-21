const express = require('express');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config');
const { signupValidation, verifyAtomicity, signinValidation, authMiddleware, updateInputValidation } = require('../middlewares/userMiddlewares');
const { User, Account } = require('../db');
const userRouter = express.Router();
const zod = require('zod');

userRouter.post("/signup", signupValidation, verifyAtomicity, async (req, res) => {
    const body = req.body;
    
    try{
        const balance = Math.floor(Math.random() * 10000) + 1;
        const user = await User(body);

        let hashedPassword = await user.createHash(req.body.password);
        user.password_hash = hashedPassword;

        await user.save();

        await Account.create({
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
        });
    
        if(!user){
            return res.status(411).json({
                message: "Error while logging in"
            });
        }
        
        if(! await user.validatePassword(password)){
            return res.status(411).json({
                message: "Error while logging in"
            });
        }

        const token = jwt.sign({
            userId: user._id
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
    
    try{
        const token = req.headers.authorization.split(" ")[1];
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

userRouter.get("/info", authMiddleware, async (req, res) => {
    const userId = req.userId;

    try{
        let user = await User.findOne({
            _id: userId
        }, 'firstName lastName');

        if(!user){
            return res.status(400).json({
                message: "You are not logged in"
            });
        }

        return res.status(200).json({
            user
        });
    } catch(error){
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
});

const filterSchema = zod.string();

userRouter.get("/bulk", authMiddleware, async (req, res) => {
    try{
        const filter = (req.query.filter || "").toLowerCase();
        const parsedFilter = filterSchema.safeParse(filter);
        if(!parsedFilter.success){
            return res.status(400).json({
                message: "Invalid filter query"
            });
        }

        const users = await User.find({
            $or: [{
                firstName: {
                    "$regex": filter
                }
            }, {
                lastName: {
                    "$regex": filter
                }
            }],
            _id: {$ne: req.userId}
        })
    
        res.json({
            users: users.map(user => ({
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