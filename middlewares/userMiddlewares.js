const zod = require('zod');
const { User } = require('../db');
const { JWT_SECRET } = require('../config');
const jwt = require('jsonwebtoken');

const signupInputSchema = zod.object({
    username: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string()
});


function signupValidation(req, res, next){
    const payload = req.body;
    const parsedPayload = signupInputSchema.safeParse(payload);
    
    if(parsedPayload.success){
        next();
    }
    else{
        res.status(411).json({
            message: "Incorrect inputs"
        });
    }
}

async function verifyAtomicity(req, res, next){
    const username = req.body.username;
    
    const user = await User.findOne({
        username: username
    });
    
    if(user){
        res.status(411).json({
            message: "Email already taken"
        });
        return;
    }
    next();
}

const signinSchema = zod.object({
    username: zod.string().email(),
    password: zod.string()
});

function signinValidation(req, res, next){
    const payload = req.body;
    const parsedPayload = signinSchema.safeParse(payload);

    if(parsedPayload.success){
        next();
        return;
    }
    res.status(411).json({
        message: "Error while logging in"
    });
}

const tokenSchema = zod.string();

function authMiddleware(req, res, next){
    let unfilteredToken = req.headers.authorization;

    const parsedUnfilteredToken = tokenSchema.safeParse(unfilteredToken);
    if(!parsedUnfilteredToken.success){
        return res.status(403).json({
            message: "Invalid Token"
        });
    }

    if(!unfilteredToken || !unfilteredToken.startsWith("Bearer ")){
        return res.status(403).json({
            message: "Invalid Token"
        });
    }
    unfilteredToken = unfilteredToken.split(" ");
    const filteredToken = unfilteredToken[1];

    try{
        const decoded = jwt.verify(filteredToken, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch(error){
        console.log(error);
        return res.status(403).json({msg: error.message});
    }
}

const updateSchema = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
}).strict();

function updateInputValidation(req, res, next){
    const payload = req.body;
    if(Object.keys(payload).length === 0){
        return res.status(400).json({
            message: "Nothing to update"
        });
    }
    const parsedPayload = updateSchema.safeParse(payload);
    if(!parsedPayload.success){
        return res.status(411).json({
            message: "Error while updating information"
        });
    }

    next();
}

module.exports = {
    signupValidation,
    verifyAtomicity,
    signinValidation,
    authMiddleware,
    updateInputValidation
}