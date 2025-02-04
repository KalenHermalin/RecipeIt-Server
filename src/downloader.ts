
import { downloadResult } from "./types";
import Tiktok from "@tobyg74/tiktok-api-dl"
import path from 'path';
import * as fs from "fs";
import child_process from "child_process";
import util from 'node:util';

import { __dirname, __filename } from '../index';
import { randomUUID } from "node:crypto";
export abstract class Downloader {
    private static execs = util.promisify(child_process.exec);

    public static async tiktok(url: string): Promise<downloadResult> {
        const result: downloadResult = { status: "error", source: "tiktok" }
        return Tiktok.Downloader(`${url}`, { version: "v3" }).then(async (data) => {
            if (data.status === "success" && data.result) {
                const url = data.result.videoHD;
                const UUID = randomUUID()
                const descPath = path.join(__dirname, "videos", "tiktok", `${UUID.toString()}.txt`)
                const descDir = path.dirname(descPath);

                if (!fs.existsSync(descDir)) {
                    fs.mkdirSync(descDir, { recursive: true });
                }
                if (data.result.desc) {
                    try {
                        fs.writeFileSync(descPath, data.result.desc);
                    } catch (err) {
                        result.status = "error";
                        result.error = "Error writing discription"
                        console.warn("Error writing discription: ", err)
                    }
                }

                const video = await fetch(url as string);

                if (video?.body) {

                    const vidPath = path.join(__dirname, "videos", "tiktok", `${UUID.toString()}.flac`)

                    let _file = fs.createWriteStream(vidPath);
                    let stream: WritableStream<Uint8Array> = new WritableStream({
                        write(chunk) {
                            _file.write(chunk);
                        },
                        close() {
                            _file.close();
                        }
                    });
                    await video.body.pipeTo(stream);
                    //const tiktokFlacPath = path.join(__dirname, "videos", "tiktok", `${UUID.toString()}.kalen`);
                    //  await this.execs(`ffmpeg  -i "${vidPath}" -ar 16000  -ac 1  -map 0:a  -c:a flac  "${tiktokFlacPath}"`);
                    if (!fs.existsSync(vidPath)) {
                        result.error = "Error saving video"
                        result.status = 'error'
                    }
                    result.status = "success";
                    result.error = '';
                    result.videoID = UUID;

                    return result

                } else {
                    result.status = "error"
                    result.error = "Error resolving video"
                }
                /*  if (data.result.desc) {
                      recipe = RecipeExtractor.extract(await RecipeExtractor.analyzeText(data.result.desc));
                      if (recipe.status === "success") {
                          return recipe;
                      }
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
              return recipe;*/
            }
            result.error = "Error finding titkok"
            result.status = 'error'
            return result;
        });
    }

    public static async insta(url: string): Promise<downloadResult> {
        const reelIdRegex = RegExp(`https:\/\/www\.instagram\.com\/[^\/]+\/([^\/?]+)`);
        const result: downloadResult = { status: "error", source: "instagram" }

        const id = reelIdRegex.exec(url)?.[1];

        if (!id) {
            console.error("ID ERROR")
            result.error = "Cannot find reel"
            return result;
        }

        const UUID = randomUUID()
        await this.execs(`instaloader --no-video-thumbnails --no-metadata-json --no-pictures  --slide 1 --filename-pattern=insta -q -- -${id}`);
        const oldVidPath = path.join(__dirname, `-${id}`, `insta_1.mp4`);
        if (!fs.existsSync(oldVidPath)) {
            result.error = "Error downloading instagram reel"
            result.status = "error"
            console.error("DOWNLOAD ERROR")
            return result
        }
        const commentPath = path.join(__dirname, `-${id}`, `insta.txt`);

        const descPath = path.join(__dirname, "videos", "insta", `${UUID.toString()}.txt`)
        if (fs.existsSync(commentPath)) {
            const descDir = path.dirname(descPath);
            if (!fs.existsSync(descDir)) {
                fs.mkdirSync(descDir, { recursive: true });
            }
            try {
                fs.renameSync(commentPath, descPath)

            } catch (error) {
                result.error = "Error modifying video file"
                result.status = 'error'
                console.error("RENAME ERROR:", error)
                fs.rm(commentPath, (err) => {
                    if (err) {
                        console.warn("Clean up failed: ", err)
                    }
                })
                return result;
            }
        }
        const vidPath = path.join(__dirname, "videos", "insta", `${UUID.toString()}.flac`)

        await this.execs(`ffmpeg  -i "${oldVidPath}" -ar 16000  -ac 1  -map 0:a  -c:a flac  "${vidPath}"`);
        if (fs.existsSync(vidPath)) {

            const dirPath = path.dirname(oldVidPath);
            fs.rm(dirPath, { recursive: true, force: true }, (err) => {
                if (err)
                    console.error(`Error: ${err}\n Path: ${dirPath}`)
            })
            result.status = 'success'
            result.error = ''
            result.videoID = UUID;
            return result;
        }
        else {

            fs.rm(oldVidPath, (err) => {
                if (err)
                    console.error(`Error: ${err}\n File:${oldVidPath}`)
            })
            fs.rm(descPath, (err) => {
                if (err)
                    console.error(`Error: ${err}\n File:${descPath}`)
            })
            console.error("CONVERTING ERROR")
            result.error = "Error converting to flac"
            result.status = "error"
            return result;
        }
    }

}