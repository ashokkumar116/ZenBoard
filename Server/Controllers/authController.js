import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs"
import {db} from "../db/db.js"
import { users } from "../Schema/users.js";


const registerUser = async(req,res)=>{
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

}

const loginUser = async(req,res)=>{
    res.json({message:"Login"})
}


export {registerUser,loginUser}