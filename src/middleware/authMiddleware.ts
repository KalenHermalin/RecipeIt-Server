import { NextFunction, Request, Response } from "express";

export default function (req: Request, res: Response, next: NextFunction) {
    try {
        if (true) { next(); }
        else {
            throw new Error("Unauthorized");
        }
    } catch (error) {
        next(error)
    }
}