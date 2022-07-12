import express, { json } from "express";
import dotenv from "dotenv";
import router from "./routers/index.js";

dotenv.config();

const app = express();
app.use(json());
app.use(router);

const port = +process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server online on port ${port}`);
})