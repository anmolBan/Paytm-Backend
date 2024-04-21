const express = require('express');
const zod = require('zod');
const { Account, User } = require('../db');
const { authMiddleware } = require('../middlewares/userMiddlewares');
const mongoose = require('mongoose');
const accountRouter = express.Router();

accountRouter.get("/balance", authMiddleware, async (req, res) => {

    try{
        const account = await Account.findOne({
            userId: req.userId
        });

        if(account){
            return res.status(200).json({
                balance: account.balance
            });
        }
        return res.status(400).json({
            message: `No account found`
        });
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
    
    try{
        const payload = req.body;
        const parsedPayload = transferInputValidation.safeParse(payload);
    
        if(!parsedPayload.success){
            return res.status(400).json({
                message: "Invalid inputs"
            });
        }
        // To check whether the recipient user exists or not, doing this to prevent transaction due to data inconsistency
        const user = await User.findOne({
            _id: payload.to
        });

        if(!user){
            return res.status(400).json({
                message: "No user found with the given id" // if not, then return
            });
        }

        const session = await mongoose.startSession();

        session.startTransaction();
        const {to, amount} = req.body;

        const fromAccount = await Account.findOne({
            userId: req.userId
        }).session(session);

        if(!fromAccount || amount > fromAccount.balance){
            await session.abortTransaction();
            return res.status(400).json({
                message: "Insufficient balance"
            });
        }

        const toAccount = await Account.findOne({
            userId: to
        }).session(session);

        if(!toAccount){
            await session.abortTransaction();
            return res.status(400).json({
                message: "Invalid Account"
            });
        }

        await Account.updateOne({userId: req.userId}, {$inc : {balance: -amount}}).session(session);
        await Account.updateOne({userId: to}, {$inc: {balance: amount}}).session(session);
        
        await session.commitTransaction();
        res.status(200).json({
            message: "Transfer successful"
        });
    } catch(error){
        console.error(error);
        res.status(500).json({
            message: error
        });
    }
});


module.exports = accountRouter