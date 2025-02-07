import express, { Request, Response } from "express";
import * as fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
import { downloadResult, result } from './src/types';
import { Downloader } from './src/downloader';
import { RecipeExtractor } from "./src/recipeExtractor";
export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);


async function downloadYoutube(url: string): Promise<null | Error> {
  return null;
}

async function tikTokHandler(url: string): Promise<downloadResult> {
  return await Downloader.tiktok(url)

}


async function downloadInsta(url: string): Promise<downloadResult> {
  return await Downloader.insta(url);
}
function parseURL(url: string): string {
  if (url.includes("instagram")) return "instagram"
  else if (url.includes("youtube")) return "youtube"
  else if (url.includes("tiktok")) return "tiktok"
  return "invalid"
}
async function downloadHandler(req: Request, res: Response) {
  let downloadUrl: string = req.headers["download-url"] as string;
  let downloadSource: string = parseURL(downloadUrl)
  let result: result;
  switch (downloadSource) {
    case "youtube":
      result = { status: "error", recipe: {}, error: "Youtube Downloads Not Implemented Yet" };
      res.status(500).send(result);
      break;
    case "tiktok":
      res.send(await tikTokHandler(downloadUrl))
      break;

    case "instagram":
      res.send(await downloadInsta(downloadUrl));
      break;
    default: res.status(400).send("Invalid download source");
  }
  return;

}
async function recipeHandler(req: Request, res: Response) {
  // 
  const videoId: string = req.params["videoId"];
  // FIND RECIPE and RETURN
  const t = await RecipeExtractor.createRecipe(videoId);
  res.send(`received ${videoId}, ${t}`)
}
const app = express();
app.use(express.json());
app.get("/recipes/:videoId", recipeHandler);
app.post("/videos", downloadHandler)

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});