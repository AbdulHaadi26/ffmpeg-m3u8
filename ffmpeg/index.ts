import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import ffmpegPath from "ffmpeg-static";

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

const createToThumbnail = async (name: string) => {
  const outputDir = path.join("output", "thumbnail");
  await fs.promises.mkdir(outputDir, { recursive: true });

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(path.join("input", `${name}.mp4`))
      .outputOptions("-ss 00:00:03.000")
      .outputOptions("-vf scale=250:-1")
      .outputOptions("-vframes 1")
      .outputOptions("-f image2")
      .output(path.join(outputDir, `${name}_thumb.jpg`))
      .on("stderr", (stderrLine: string) => {
        console.log("FFmpeg stderr: " + stderrLine);
      })
      .on(
        "error",
        (error: Error, stdout: string | null, stderr: string | null) => {
          console.log("FFmpeg error: " + error.message);
          console.log("FFmpeg stdout: " + stdout);
          console.log("FFmpeg stderr: " + stderr);
          reject(error);
        }
      )
      .on("end", () => {
        console.log("Media thumbnail generation complete");
        resolve(path.join(outputDir, `${name}_thumb.jpg`));
      })
      .run();
  });
};

const convertToStream = async (name: string) => {
  const outputDir = path.join("output", "stream");
  await fs.promises.mkdir(outputDir, { recursive: true });

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(path.join("input", `${name}.mp4`))
      .audioCodec("aac")
      .videoCodec("libx264")
      .outputOptions("-preset ultrafast")
      .outputOptions("-movflags +faststart")
      .outputOptions("-hls_time 3")
      .outputOptions("-g 48")
      .outputOptions("-sc_threshold 0")
      .outputOptions("-b:v 2800k")
      .outputOptions("-maxrate 2996k")
      .outputOptions("-bufsize 4200k")
      .outputOptions("-b:a 128k")
      .outputOptions("-hls_playlist_type vod")
      .outputOptions(
        `-hls_segment_filename ${path.join(outputDir, `${name}_part_%03d.ts`)}`
      )
      .videoFilter("pad=ceil(iw/2)*2:ceil(ih/2)*2")
      .output(path.join(outputDir, `${name}.m3u8`))
      .on("stderr", (stderrLine: string) => {
        console.log("FFmpeg stderr: " + stderrLine);
      })
      .on(
        "error",
        (error: Error, stdout: string | null, stderr: string | null) => {
          console.log("FFmpeg error: " + error.message);
          console.log("FFmpeg stdout: " + stdout);
          console.log("FFmpeg stderr: " + stderr);
          reject(error);
        }
      )
      .on("end", () => {
        console.log("Media conversion complete");
        resolve(outputDir);
      })
      .run();
  });
};

export { createToThumbnail, convertToStream };
