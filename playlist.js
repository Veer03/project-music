import { getConfig } from "./config.js";
import { downloadSong } from "./download.js";
import chalk from "chalk";
import { spawn, execSync } from "child_process";
import ffmpegPath from "ffmpeg-static";
import ora from "ora";

// ── SHARED UI ─────────────────────────────────────────────
// this runs the same UI for both list and yt playlist
// no bar — just spinner per song + summary at end
async function downloadWithUI(songs, downloadFn) {
  const total = songs.length;
  let failed = [];

  for (let i = 0; i < songs.length; i++) {
    // spinner for each song
    const spinner = ora({
      text: chalk.yellow(`[${i + 1}/${total}] Downloading: ${songs[i]}...`),
      color: "magenta",
    }).start();

    try {
      await downloadFn(songs[i], true); // pass true to silent individual spinners
      spinner.succeed(chalk.green(`[${i + 1}/${total}] ✅ ${songs[i]}`));
    } catch {
      spinner.fail(chalk.red(`[${i + 1}/${total}] ❌ ${songs[i]}`));
      failed.push(songs[i]); // track failed songs
    }
  }

  // final summary
  console.log(
    chalk.green(`\n  ✅ ${total - failed.length}/${total} songs downloaded!`),
  );
  if (failed.length > 0) {
    console.log(chalk.red(`  ❌ Failed: ${failed.join(", ")}\n`));
  } else {
    console.log();
  }
}

// ── LIST PLAYLIST ─────────────────────────────────────────
// user pastes comma or newline separated song names
export async function downloadList(input) {
  // split by comma or newline, clean up spaces
  const songs = input
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(chalk.cyan(`\n  Found ${songs.length} songs!\n`));

  // use shared UI — pass downloadSong as the download function
  await downloadWithUI(songs, downloadSong);
}

// ── YOUTUBE PLAYLIST ──────────────────────────────────────
// user pastes a youtube playlist URL, we fetch titles first then download
export async function downloadYoutubePlaylist(url) {
  const { outputDir } = getConfig();

  console.log(chalk.cyan("\n  Fetching playlist info...\n"));

  // get all song titles from playlist first before downloading
  const titles = execSync(
    `".\\yt-dlp.exe" --flat-playlist --print title --js-runtimes node "${url}"`,
    { encoding: "utf8" },
  )
    .trim()
    .split("\n")
    .filter((s) => s.length > 0);

  console.log(chalk.cyan(`  Found ${titles.length} songs!\n`));

  const total = titles.length;
  let completed = 0;

  // one spinner that updates text as each song downloads
  const spinner = ora({
    text: chalk.yellow(`[1/${total}] Starting...`),
    color: "magenta",
  }).start();

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

  dl.stdout.on("data", (data) => {
    const line = data.toString();

    // new song starting — update spinner text
    if (line.includes("[download] Downloading item")) {
      const match = line.match(/item (\d+) of (\d+)/);
      if (match) {
        const current = parseInt(match[1]);
        completed = current;
        spinner.text = chalk.yellow(
          `[${current}/${total}] Downloading song ${current}...`,
        );
      }
    }
  });

  dl.stderr.on("data", (data) => {
    const line = data.toString();
    // show percentage in spinner text so user knows its alive
    if (line.includes("%")) {
      spinner.text = chalk.yellow(`[${completed}/${total}] ${line.trim()}`);
    }
  });

  return new Promise((resolve, reject) => {
    dl.on("close", (code) => {
      spinner.stop();

      if (code === 0) {
        console.log(chalk.green(`\n  ✅ All ${total} songs downloaded!\n`));
        resolve();
      } else {
        console.log(chalk.red("\n  ❌ Failed!\n"));
        reject();
      }
    });
  });
}
