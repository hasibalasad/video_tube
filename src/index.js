import dotent from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotent.config({
    path: "/.env",
});

const port = process.env.PORT || 8000;

connectDB()
    .then(() => {
        app.on("error", (err) => {
            console.log("listening error" + err);
        });
        app.listen(port, () => {
            console.log(`server is listening at port ${port}`);
        });
    })
    .catch((error) => {
        console.log("ERROR: DB connection" + error);
    });
