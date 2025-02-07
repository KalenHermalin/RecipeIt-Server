
import { result, resultSchema } from "./types";
import * as fs from "fs";
import groq from 'groq-sdk';
import { __dirname, __filename } from '../index';
import path from "path";


export abstract class RecipeExtractor {
    private static gClient = new groq({
        apiKey: process.env.GROQ_KEY,
    });
    private static extract(transcript: string): result {
        let obj: result = JSON.parse(transcript);
        return obj;
    }
    private static async transcribe(path: string): Promise<string> {
        const transcript = await this.gClient.audio.transcriptions.create({
            file: fs.createReadStream(path),
            model: "distil-whisper-large-v3-en",
        })
        return transcript.text;
    }

    private static async analyzeText(text: string): Promise<string> {
        const response = await this.gClient.chat.completions.create({
            messages: [
                {
                    role: "system", content: `You are an assistant whose job is to analyze a bodies of text
              and see if there is a recipe in it. You are to return a string which represents a JSON object
              with the following schema: ${JSON.stringify(resultSchema, null, 4)}. 
              The status can be either "success" or "error" depending on if a recipe is found or not.
              The recipe is an object which contains the recipe if found, 
              where each key is an ingredient, and the vaule is the quantity. If no recipe is found, the object is empty.
              The error should be an empty string if no error occurs, otherwise it should contain the error message.
              ` },
                { role: "user", content: `${text}` }
            ],
            stream: false,
            response_format: { type: "json_object" },
            model: "llama-3.1-8b-instant",
            temperature: 0.1
        });
        return response.choices[0].message.content as string;
    }

    public static async createRecipe(videoId: string) {
        const vidPath = path.join(__dirname, "videos", `${videoId}`, "vid.flac");

        if (fs.existsSync(path.dirname(vidPath))) {
            const descPath = path.join(__dirname, "videos", `${videoId}`, "desc.txt")
            if (fs.existsSync(descPath)) {
                const desc: string = fs.readFileSync(descPath).toString();
                const result = this.extract(await this.analyzeText(desc));
                if (result.status == 'success') return result;
            }
            const transcript = await this.transcribe(vidPath);
            const result = this.extract(await this.analyzeText(transcript));
            return result;
        }
    }
}