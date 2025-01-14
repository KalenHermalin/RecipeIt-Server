
import { RecipeExtractor } from "./recipeExtractor";
import { result } from "./types";
import Tiktok from "@tobyg74/tiktok-api-dl"
import path from 'path';
import * as fs from "fs";
import child_process from "child_process";
import util from 'node:util';

import { __dirname, __filename } from '../index';
export abstract class Downloader {
    private static execs = util.promisify(child_process.exec);

    public static async tiktok(url: string): Promise<result> {
        return Tiktok.Downloader(`${url}`, { version: "v3" }).then(async (data) => {
            let recipe: result = { status: "error", recipe: {}, error: "" };
            if (data.status === "success" && data.result) {
                if (data.result.desc) {
                    recipe = RecipeExtractor.extract(await RecipeExtractor.analyzeText(data.result.desc));
                    if (recipe.status === "success") {
                        return recipe;
                    }
                }
                const url = data.result.videoHD;
                const video = await fetch(url as string);
                let _file = fs.createWriteStream(`${__dirname}/tiktok.mp4`);
                let stream: WritableStream<Uint8Array> = new WritableStream({
                    write(chunk) {
                        _file.write(chunk);
                    },
                    close() {
                        _file.close();
                    }
                });
                if (video?.body) {
                    await video.body.pipeTo(stream);
                    const tiktokMp4Path = path.join(__dirname, 'tiktok.mp4');
                    const tiktokFlacPath = path.join(__dirname, 'tiktok.flac');
                    await this.execs(`ffmpeg  -i "${tiktokMp4Path}" -ar 16000  -ac 1  -map 0:a  -c:a flac  "${tiktokFlacPath}"`);
                    if (!fs.existsSync(tiktokFlacPath)) {
                        recipe.error = "Error converting tiktok to flac";
                        fs.unlink(tiktokMp4Path, (err) => { if (err) console.log(err) });
                        return recipe;
                    }
                    const transcript = await RecipeExtractor.transcribe(tiktokFlacPath)
                    recipe = RecipeExtractor.extract(await RecipeExtractor.analyzeText(transcript));
                    fs.unlink(tiktokMp4Path, (err) => { if (err) console.log(err) });
                    fs.unlink(tiktokFlacPath, (err) => { if (err) console.log(err) });
                    if (recipe.status === "success") {
                        return recipe;
                    }
                    return recipe;
                }
                recipe.error = "Error downloading tiktok";
                return recipe;
            }
            recipe.error = "Error finding tiktok";
            return recipe;
        });
    }

    public static async insta(url: string): Promise<result> {
        const reelIdRegex = RegExp(`https:\/\/www\.instagram\.com\/[^\/]+\/([^\/?]+)`);
        const id = reelIdRegex.exec(url)?.[1];
        let result: result = { status: "error", recipe: {}, error: "start" };
        if (!id) {
            result.error = "Invalid instagram url";
            return result;
        }
        await this.execs(`instaloader --no-video-thumbnails --no-metadata-json --no-pictures  --slide 1 --filename-pattern=insta -q -- -${id}`);

        const commentPath = path.join(__dirname, `-${id}`, `insta.txt`);
        fs.readdirSync(path.join(__dirname, `-${id}`)).forEach(file => {
            if (path.extname(file) === ".mp4") {
                fs.renameSync(path.join(__dirname, `-${id}`, file), path.join(__dirname, `-${id}`, "insta.mp4"));
            }
        });
        const videoPathMp4 = path.join(__dirname, `-${id}`, `insta.mp4`);
        const videoPathFlac = path.join(__dirname, `-${id}`, `insta.flac`);
        if (!fs.existsSync(videoPathMp4)) {
            result.error = "Error downloading instagram";
            return result;
        }
        if (fs.existsSync(commentPath)) {
            const desc = fs.readFileSync(commentPath).toString();
            result = RecipeExtractor.extract(await RecipeExtractor.analyzeText(desc));
            if (result.status === "success") {
                fs.rm(path.join(__dirname, `-${id}`), { recursive: true }, (err) => { if (err) console.log(err) });
                return result;
            }
        }
        await this.execs(`ffmpeg  -i "${videoPathMp4}" -ar 16000  -ac 1  -map 0:a  -c:a flac  "${videoPathFlac}"`);
        if (fs.existsSync(videoPathFlac)) {
            result = RecipeExtractor.extract(await RecipeExtractor.analyzeText(await RecipeExtractor.transcribe(videoPathFlac)));
            fs.rm(path.join(__dirname, `-${id}`), { recursive: true }, (err) => { if (err) console.log(err) });
            if (result.status === "success") {
                return result;
            }
        }
        return result;
    }

}