import express from "express";
import "dotenv/config"
import cors from "cors"


const app = express();


app.use(express.json());
app.use(cors({
    origin: `${process.env.CLIENT_URL}`,
    credentials: true,
}));

app.get("/", (req, res) => {
    res.send("Server is running");
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});