import { getConfig } from "./config.js";
import { downloadSong } from "./download.js";
import chalk from "chalk";
import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";

//list playlist
export async function downloadList(input) {
  // split by comma or newline, clean up spaces
  const songs = input
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(
    chalk.cyan(`\n  Found ${songs.length} songs — starting downloads!\n`),
  );

  // download one by one
  for (let i = 0; i < songs.length; i++) {
    console.log(chalk.yellow(`\n  [${i + 1}/${songs.length}] ${songs[i]}`));
    await downloadSong(songs[i]);
  }

  console.log(
    chalk.green(`\n  DONE!!, All ${songs.length} songs downloaded!\n`),
  );
}

// url yt playlist
export async function downloadYoutubePlaylist(url) {
  const { outputDir } = getConfig();

  console.log(chalk.cyan("\n Fetching Playlist Info. . . \n"));

  const dl = spawn(".\\yt-dlp.exe", [
    url,
    "--js-runtimes",
    "node",
    "-x",
    "--audio-format",
    "mp3",
    "--audio-quality",
    "0",
    "-o",
    `${outputDir}/%(title)s.mp3`,
    "--ffmpeg-location",
    ffmpegPath,
  ]);

  let songCount = 0;

  dl.stdout.on("data", (data) => {
    const line = data.toString();

    //show the song which is daunloading
    if (line.includes("%")) {
      process.stdout.write(chalk.magenta(`\r ${line.trim()}`));
    }

    if (line.includes("Finished downloading")) {
      songCount++;
    }
  });

  dl.stderr.on("data", (data) => {
    const line = data.toString();
    if (line.includes("%")) {
      process.stdout.write(chalk.magenta(`\r  ${line.trim()}`));
    }
  });

  return new Promise((resolve, reject) => {
    dl.on("close", (code) => {
      if (code === 0) {
        console.log(chalk.green(`\n\n  ✅ Playlist downloaded!\n`));
        resolve();
      } else {
        console.log(chalk.red("\n  ❌ Failed!\n"));
        reject();
      }
    });
  });
}
