import path from "path";
import fs from 'fs';
import { RecipeExtractor } from "../recipeExtractor";
import express, { NextFunction, Request, Response } from "express";
import { __dirname, __filename } from '../../index';

async function createRecipe(videoId: string) {
    const vidPath = path.join(__dirname, "videos", `${videoId}`, "vid.flac");
    console.log(path.dirname(vidPath))
    if (fs.existsSync(path.dirname(vidPath))) {
        const descPath = path.join(__dirname, "videos", `${videoId}`, "desc.txt")
        if (fs.existsSync(descPath)) {
            const desc: string = fs.readFileSync(descPath).toString();
            const result = await RecipeExtractor.analyzeText(desc);
            if (result.status == 'success') return result;
        }
        const transcript = await RecipeExtractor.transcribe(vidPath);
        const result = await RecipeExtractor.analyzeText(transcript);

        if (result.status == 'success') {
            return result;
        }
        const err = new Error("Error Creating Recipe");
        err.name = "ECR";
        throw err;
    } else {
        const err = new Error("Invalid Video ID");
        err.name = "EIV"
        throw err;

    }
}

export default async function recipeHandler(req: Request, res: Response, next: any) {
    // 
    const videoId: string = req.params["videoId"];
    try {
        const recipe = await createRecipe(videoId);
        console.log(recipe)
        res.json(recipe)

    } catch (error) {
        next(error)
    }
}
