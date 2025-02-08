import express, { NextFunction, Request, Response } from "express";

export default function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
    res.status(500).json({ status: "error", message: err.message, cause: err.cause })
}