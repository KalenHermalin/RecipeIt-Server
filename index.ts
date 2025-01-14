import { youtubeDl } from 'youtube-dl-exec';
import express, { Request, Response } from "express";
import * as fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
import { result } from './src/types';
import { Downloader } from './src/downloader';

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);


async function downloadYoutube(url: string): Promise<null | Error> {
  let k = await youtubeDl(`${url}`, {
    extractAudio: true,
    audioFormat: 'mp3',
    output: `${__dirname}/data/video.%(ext)s`,
    format: 'bestaudio',
  });
  if (fs.existsSync(`${__dirname}/data/video.mp3`)) {
    return null;
  } else {
    let error: Error = Error("Error downloading youtube");
    return error;
  }
}

async function tikTokHandler(url: string): Promise<result> {
  // RATE LIMITING
  return await Downloader.tiktok(url)

}


async function downloadInsta(url: string): Promise<result> {
  return await Downloader.insta(url);
}

async function downloadHandler(req: Request, res: Response) {
  let downloadSource: string = req.headers["download-source"] as string;
  let downloadUrl: string = req.headers["download-url"] as string;
  let result: result;
  switch (downloadSource) {
    case "youtube":
      result = { status: "error", recipe: {}, error: "Instagram Downloads Not Implemented Yet" };
      res.status(500).send(result);
      break;
    case "tiktok":
      result = await tikTokHandler(downloadUrl);
      res.send(result)
      break;

    case "instagram":
      result = await downloadInsta(downloadUrl);
      res.send(result);
      break;
    default: res.status(400).send("Invalid download source");
  }
  return;

}

const app = express();
app.use(express.json());
app.get("/download", downloadHandler);

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});