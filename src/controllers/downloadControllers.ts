import { Downloader } from "../downloader";
import express, { NextFunction, Request, Response } from "express";

function parseURL(url: string): string {
    if (url) {
        if (url.includes("instagram")) return "instagram"
        else if (url.includes("youtube")) return "youtube"
        else if (url.includes("tiktok")) return "tiktok"
    }
    return "invalid"
}
export default async function downloadHandler(req: Request, res: Response, next: NextFunction) {
    let downloadUrl: string = req.body.url;
    let downloadSource: string = parseURL(downloadUrl)
    try {
        let err;
        switch (downloadSource) {
            case "youtube":
                err = new Error("Youtube Not Implemented")
                err.name = "NYI";
                throw err;
                break;
            case "tiktok":
                res.send(await Downloader.tiktok(downloadUrl))
                break;

            case "instagram":
                res.send(await Downloader.insta(downloadUrl));
                break;
            default:
                err = new Error("Invalid Download Source")
                err.name = "IDS";
                throw err;
        }
    } catch (error) {
        next(error);
    }
}
