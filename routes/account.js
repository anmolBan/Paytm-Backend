const express = require('express');
const zod = require('zod');
const jwt = require('jsonwebtoken');
const { Account, User } = require('../db');
const { authMiddleware } = require('../middlewares/userMiddlewares');
const { JWT_SECRET } = require('../config');

const accountRouter = express.Router();

accountRouter.get("/balance", authMiddleware, async (req, res) => {
    const userId = req.query.userId;

    try{
        const account = await Account.findOne({
            userId: userId
        });

        if(account){
            return res.status(200).json({
                balance: account.balance
            });
        }
        return res.status(400).json({
            message: `No account found`
        })
    } catch(error){
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }
});

const transferInputValidation = zod.object({
    to: zod.string(),
    amount: zod.number()
});

accountRouter.post("/transfer", authMiddleware, async (req, res) => {
    const payload = req.body;
    const parsedPayload = transferInputValidation.safeParse(payload);

    if(!parsedPayload.success){
        return res.status(400).json({
            message: "Invalid inputs"
        });
    }

    try{
        const user = await User.findOne({
            username: req.username
        });

        const account1 = await Account.findOne({
            userId: user._id
        });

        if(!account1){
            return res.status(400).json({
                message: "Invalid account1"
            });
        }

        if(payload.amount > account1.balance){
            return res.status(400).json({
                message: "Isufficient balance"
            });
        }

        await Account.findOneAndUpdate({
            userId: user._id
        }, {
            $inc: {balance: -payload.amount}
        });

        const account2 = await Account.findOneAndUpdate({
            userId: payload.to
        }, {
            $inc: {balance: payload.amount}
        });

        if(!account2){
            return req.status(400).json({
                message: "Invalid Account2"
            });
        }

        res.status(200).json({
            message: "Transfer successful"
        });

    } catch(error){
        console.log(error);
        res.status(500).json({
            message: error.message
        });
    }

});


module.exports = accountRouter