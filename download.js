import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";
import cliProgress from "cli-progress";
import chalk from "chalk";
import ora from "ora";
import { getConfig } from "./config.js";

export async function downloadSong(song, silent = false) {
  const spinner = silent
    ? null
    : ora({
        text: chalk.yellow(`Searching for "${song}"...`),
        color: "magenta",
      }).start();

  return new Promise((resolve, reject) => {
    const bar = new cliProgress.SingleBar({
      format: chalk.magenta(
        "  Downloading |{bar}| {percentage}% | {eta}s remaining",
      ),
      barCompleteChar: "█",
      barIncompleteChar: "░",
      hideCursor: true,
    });
    //
    const { outputDir } = getConfig();
    //
    let barStarted = false;

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
      `${outputDir}/%(title)s.mp3`,
      "--no-playlist",
      "--ffmpeg-location",
      ffmpegPath,
    ]);

    dl.stdout.on("data", (data) => {
      const line = data.toString();

      // switch from spinner to progress bar on first download line
      if (
        line.includes("[download]") &&
        line.includes("%") &&
        !barStarted &&
        !silent
      ) {
        if (spinner) spinner.succeed(chalk.green(`Found: ${song}`));
        bar.start(100, 0);
        barStarted = true;
      }

      const match = line.match(/(\d+\.?\d*)%/);
      if (match && barStarted) {
        bar.update(parseFloat(match[1]));
      }
    });

    dl.on("close", (code) => {
      if (barStarted) {
        bar.update(100);
        bar.stop();
      } else {
        if (spinner) spinner.stop();
      }

      if (code === 0) {
        if (spinner)
          console.log(chalk.green(`\n  ✅ Saved to music folder!\n`));
        resolve();
      } else {
        if (spinner) console.log(chalk.red("\n  ❌ Failed!\n"));
        reject();
      }
    });
  });
}
