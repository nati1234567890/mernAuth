import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { connectdb } from "./config/mongodb.js";
import router from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 4000;
app.use(cookieParser());
app.use(express.json());

app.use(cors({ credentials: true, origin: "http://localhost:5173" }));

connectdb();
app.listen(port, () => console.log(`server started on port ${port}`));

app.use("/auth", router);
