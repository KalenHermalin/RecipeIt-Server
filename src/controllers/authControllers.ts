import { NextFunction, Request, Response } from "express";

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
    const error = new Error("Sign up not implemented");
    error.name = "NYI";
    next(error);
}

export const signIn = async (req: Request, res: Response, next: NextFunction) => {
    const error = new Error("Sign in not implemented");
    error.name = "NYI";
    next(error);
}

export const signOut = async (req: Request, res: Response, next: NextFunction) => {
    const error = new Error("Sign out not implemented");
    error.name = "NYI";
    next(error);
}