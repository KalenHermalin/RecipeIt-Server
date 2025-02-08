import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import errorMiddleware from "./src/middleware/errorMiddleware";
import authRouter from "./src/routes/authRoutes";
import authMiddleware from "./src/middleware/authMiddleware";
import recipeHandler from "./src/controllers/recipeController";
import downloadHandler from "./src/controllers/downloadControllers";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get("/", (req, res) => { res.send("Recipe Extractor API → Private Access Required") });
app.use("/api/v1/auth", authRouter);
app.use(authMiddleware)
app.get("/api/v1/recipe/:videoId", recipeHandler);
app.post("/api/v1/video", downloadHandler)
app.use(errorMiddleware);

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});