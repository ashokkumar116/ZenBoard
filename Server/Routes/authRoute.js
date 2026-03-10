import express from "express";
import { checkAuth, loginUser, logoutUser, registerUser } from "../Controllers/authController.js";
import { isLoggedIn } from "../Middlewares/isLoggedIn.js";

const router = express.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/logout",isLoggedIn,logoutUser);
router.get("/me",isLoggedIn,checkAuth);


export default router;