import express from "express";
import { loginUser, logoutUser, registerUser } from "../Controllers/authController.js";
import { isLoggedIn } from "../Middlewares/isLoggedIn.js";

const router = express.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/logout",isLoggedIn,logoutUser);


export default router;