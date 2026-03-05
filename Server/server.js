import express from "express";
import "dotenv/config"
import cors from "cors"
import authRoute from "./Routes/authRoute.js";
import cookieParser from "cookie-parser";

const app = express();


app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: `${process.env.CLIENT_URL}`,
    credentials: true,
}));

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.use("/api/auth", authRoute);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});