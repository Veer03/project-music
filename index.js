// const chalk = require("chalk");
// const figlet = require("figlet");

// let x = "Welcome to";

// console.log(chalk.hex("#DEADED").bold.dim("Bold gray!"));
// figlet(x, "Slant", (err, txt) => {
//   let z = console.log(chalk.green.bold(txt));
// });

// for (let i = 0; i < 3; i++) {
//   setTimeout(() => {
//     figlet(" . ", "Big", (err, txt) => {
//       console.log(chalk.red.bold(txt));
//     });
//   }, 1000);
// }
// let y = chalk.yellow(figlet.fontsSync("Hello World!"));
// setTimeout(() => {
//   figlet(" misiccc !", "Larry 3D", (err, txt) => {
//     console.log(chalk.blue.bold(txt));
//   });
// }, 1000);

// // const fonts = [
// //   "Slant",..........
// //   "Big",
// //   "Block",
// //   "Banner",
// //   "Digital",
// //   "Doom",
// //   "Epic",
// //   "Larry 3D",....
// // ];

// // fonts.forEach((font) => {
// //   console.log(`\n--- ${font} ---`);
// //   console.log(figlet.textSync("Music", { font }));
// // });

import chalk from "chalk";
import figlet from "figlet";
import boxen from "boxen";
import ora from "ora";
import inquirer from "inquirer";
import cliProgress from "cli-progress";

// ── LOGO ──────────────────────────────────────────────────
const logo = figlet.textSync("Audiofy", { font: "Doom" });
console.log(chalk.magenta(logo));

// ── TAGLINE ───────────────────────────────────────────────
const tagline = boxen(
  chalk.white("🎵  Your music. Your terminal. Your rules."),
  {
    padding: 1,
    margin: 0,
    borderStyle: "round",
    borderColor: "magenta",
  },
);
console.log(tagline);
console.log();

// ── MAIN MENU ─────────────────────────────────────────────
async function mainMenu() {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: chalk.cyan("What do you want to do?"),
      choices: [
        { name: "🎵  Download a song", value: "song" },
        { name: "🎤  Download by artist", value: "artist" },
        { name: "📋  Download a list", value: "list" },
        { name: "⚙️   Settings", value: "settings" },
        { name: "❌  Exit", value: "exit" },
      ],
    },
  ]);

  if (action === "exit") {
    console.log(chalk.magenta("\n  Later! 🎵\n"));
    process.exit(0);
  }

  if (action === "song") await downloadSong();
}

// ── DOWNLOAD SONG ─────────────────────────────────────────
async function downloadSong() {
  const { songName } = await inquirer.prompt([
    {
      type: "input",
      name: "songName",
      message: chalk.cyan("Enter song name + artist:"),
      validate: (input) => input.length > 0 || "Please enter a song name",
    },
  ]);

  console.log();

  // fake spinner
  const spinner = ora({
    text: chalk.yellow(`Searching YouTube for "${songName}"...`),
    color: "magenta",
  }).start();

  await sleep(2000);
  spinner.succeed(chalk.green(`Found: ${songName} (Official Audio)`));

  console.log();

  // fake progress bar
  const bar = new cliProgress.SingleBar({
    format: chalk.magenta(
      "  Downloading |{bar}| {percentage}% | {eta}s remaining",
    ),
    barCompleteChar: "█",
    barIncompleteChar: "░",
    hideCursor: true,
  });

  bar.start(100, 0);

  for (let i = 0; i <= 100; i += 5) {
    await sleep(100);
    bar.update(i);
  }

  bar.stop();
  console.log();
  console.log(
    chalk.green(`  ✅ Saved to /music/${songName.replace(/ /g, "-")}.mp3`),
  );
  console.log();

  // back to menu
  await mainMenu();
}

// ── HELPER ────────────────────────────────────────────────
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── START ─────────────────────────────────────────────────
mainMenu();
