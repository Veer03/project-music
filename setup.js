import { existsSync } from "fs";
import fs from "fs";
import https from "https";

export async function ensureYtDlp() {
  const path = "./yt-dlp.exe";

  if (existsSync(path)) {
    return; // already exists, skip
  }

  console.log("yt-dlp not found, Downloading yt-dlp...");

  const url =
    "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe";
  const file = fs.createWriteStream(path);

  await new Promise((resolve, reject) => {
    https.get(url, (response) => {
      response.pipe(file);
      file.on("finish", resolve);
      file.on("error", reject);
    });
  });

  console.log("✅ yt-dlp ready!!");
}
