## **_RecipeIt_**
RecipeIt is a multiplatform application used to create your very own recipe book from videos such as Instagram, TikTok, and soon to be YouTube.

## What is the server?
The server, currently written in TypeScript, is a simple API that will take a video URL from one of the sources available and get the recipe from the video. 

## How does it work?
To do this, it relies on a few technologies; in order to download the Instagram videos, Instaloader is used. A command-line utility for downloading posts from Instagram with their metadata and captions and comments. For TikTok, tobyg47's tiktok-api-dl npm package, which provides the downloaded TikTok video and its description. 
After downloading the videos, it first analyzes the description of the video using the GROQ AI API and their LLMs, it is instructed to search bodies of texts for recipes,
and output a json object called result, whether there is a recipe or if there is not. If it finds a recipe in the description, it returns it as a response. If no recipe was found,
the video gets converted to a flac file using ffmpeg, this is done because GROQ's APi only allows 25mb files to be uploaded, converting them to flac makes them smaller and lossless.
Then the file gets uploaded to GROQ AI whisper models to be transcribed, after which the transcription is passed back to the LLM to search for a recipe. It returns a json object,
as before and it gets returned to the user with/without a recipe

## The Result Object
The result object is an object defined to have 3 main keys: the status key, the recipe key, and the error key. The status will always be a valid string, either success or failure.
This status comes directly from the LLM; if a recipe is found, it sets the status to success in the returned object; if not it's failure. The recipe key has another object as 
its value, where each key in that object is an ingredient and each value is the quantity of it. Finally the error key contains the error message. This can be set by the LLM,
if no recipe is found by the LLM the error will be generated saying that no recipe was found. But if an error occurs anywhere else it is caught and used as the value for the error key

## Dependencies
https://github.com/TobyG74/tiktok-api-dl

https://github.com/instaloader/instaloader

https://github.com/ytdl-org/youtube-dl
