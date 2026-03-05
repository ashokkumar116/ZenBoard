import jwt from "jsonwebtoken";


export const isLoggedIn = (req,res,next)=>{
    try {
        const token = req.cookies.token;
        console.log(token)
        if(!token){
            return res.status(401).json({message:"Unauthorized"})
        }
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET)
        req.user = decodedToken
        next();
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal server error"})
    }
}