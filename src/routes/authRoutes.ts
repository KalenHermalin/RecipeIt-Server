import { Router } from "express";
import { signIn, signOut, signUp } from "../controllers/authControllers";

const authRouter = Router();

authRouter.get("/", (req, res) => { res.send("LOL") })
authRouter.post("/sign-in", signIn);
authRouter.post("/sign-up", signUp);
authRouter.post("/sign-out", signOut);


export default authRouter;