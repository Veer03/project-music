import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";

const song = "Ring of Fire Johnny Cash";

console.log(`Downloading: ${song}...`);

const dl = spawn(".\\yt-dlp.exe", [
  `ytsearch1:${song}`,
  "--js-runtimes",
  "node",
  "-x",
  "--audio-format",
  "mp3",
  "--audio-quality",
  "0",
  "-o",
  "./music/%(title)s.mp3",
  "--no-playlist",
  "--ffmpeg-location",
  ffmpegPath,
]);

dl.stdout.on("data", (data) => {
  console.log(data.toString());
});

dl.stderr.on("data", (data) => {
  console.log(data.toString());
});

dl.on("close", (code) => {
  if (code === 0) {
    console.log("✅ Done!");
  } else {
    console.log("❌ Failed!");
  }
});
