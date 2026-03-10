import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs"
import {db} from "../db/db.js"
import { users } from "../Schema/users.js";
import jwt from "jsonwebtoken"

const registerUser = async(req,res)=>{
    try {
        const {name,email,password} = req.body;

    if(!name || !email || !password){
        return res.status(400).json({message:"All fields are required"})
    }

    const user = await db.select().from(users).where(eq(users.email,email))
    if(user.length > 0){
        return res.status(400).json({message:"User already exists"})
    }

    const salt = await bcrypt.genSalt(10)

    const hashedPassword = await bcrypt.hash(password,salt);

    await db.insert(users).values({
        name,
        email,
        password_hash: hashedPassword,
    })

    res.status(201).json({message:"User registered successfully"})
} catch (error) {
    console.log(error)
    res.status(500).json({message:"Internal server error"})
}
}

const loginUser = async(req,res)=>{
    try {
        const {email,password} = req.body;

    if(!email || !password){
        return res.status(400).json({message:"All fields are required"})
    }

    const user = await db.select().from(users).where(eq(users.email,email))
    if(user.length === 0){
        return res.status(404).json({message:"User not found"})
    }

    const isPasswordValid = await bcrypt.compare(password,user[0].password_hash)
    if(!isPasswordValid){
        return res.status(401).json({message:"Wrong password"})
    }

    const token = jwt.sign({
        id:user[0].id,
        name:user[0].name,
        email:user[0].email
    },process.env.JWT_SECRET,{
        expiresIn:"1h"
    })

    res.cookie("token",token,{
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite:process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge:3600000
    })

    res.status(200).json({message:"User logged in successfully"})
} catch (error) {
    console.log(error)
    res.status(500).json({message:"Internal server error"})
}
}

const checkAuth = async(req,res)=>{
    try {
        const user = req.user
        if(!user){
            return res.status(401).json({message:"Unauthorized"})
        }
        res.status(200).json({user})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}


const logoutUser = async(req,res)=>{
    try {
        res.clearCookie("token")
        res.status(200).json({message:"User logged out successfully"})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}


export {registerUser,loginUser,checkAuth,logoutUser}