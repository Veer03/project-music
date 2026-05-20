import {
  existsSync,
  createWriteStream,
  chmodSync,
  mkdirSync,
  statSync,
} from "fs";
import https from "https";
import path from "path";
import os from "os";

// save yt-dlp in user home directory — always has write permissions
const homeDir = os.homedir();
const ytDlpDir = path.join(homeDir, ".audiofy");

// detect OS — win32 = all windows (32 and 64 bit), anything else = mac/linux
const isWindows = os.platform() === "win32";
const ytDlpFile = isWindows ? "yt-dlp.exe" : "yt-dlp";
const ytDlpUrl = isWindows
  ? "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"
  : "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp";

export const ytDlpPath = path.join(ytDlpDir, ytDlpFile);

export async function ensureYtDlp() {
  // check if already exists AND is not 0MB (corrupt)
  if (existsSync(ytDlpPath) && statSync(ytDlpPath).size > 0) {
    return ytDlpPath; // already good, skip download
  }

  // create .audiofy folder in home dir if it doesnt exist
  if (!existsSync(ytDlpDir)) {
    mkdirSync(ytDlpDir, { recursive: true });
  }

  console.log("⬇️  Downloading yt-dlp (first time only)...");

  const url = ytDlpUrl;

  // download with redirect following — github always redirects before the real file
  await new Promise((resolve, reject) => {
    const download = (url) => {
      https.get(url, (res) => {
        // follow 301/302 redirects
        if (res.statusCode === 301 || res.statusCode === 302) {
          download(res.headers.location);
          return;
        }

        const file = createWriteStream(ytDlpPath);
        res.pipe(file);

        file.on("finish", () => {
          chmodSync(ytDlpPath, 0o755); // make executable on mac/linux
          resolve();
        });

        file.on("error", reject);
      });
    };

    download(url);
  });

  console.log("✅ yt-dlp ready!\n");
  return ytDlpPath;
}
