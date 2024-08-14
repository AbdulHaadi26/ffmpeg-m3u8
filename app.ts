import { convertToStream, createToThumbnail } from "./ffmpeg";

async function main() {
  const name = "test";
  const streamFolderPath = await convertToStream(name);
  const thumbnailPath = await createToThumbnail(name);

  console.log("Stream folder path: " + streamFolderPath);
  console.log("Thumbnail path: " + thumbnailPath);

  if (streamFolderPath && thumbnailPath) {
    console.log("Done!");
  } else {
    console.log("Failed!");
  }
}

main();
