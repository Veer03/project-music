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

// ── LOGO ─────────────────────────────────────
// ─────────────
// 1. Split "Welcome to" and a single dot into horizontal rows
const welcomeLines = figlet
  .textSync("Welcome to", { font: "Slant" })
  .split("\n");
const dotLines = figlet.textSync(" .", { font: "Slant" }).split("\n");

// 2. Print the initial "Welcome to" text
console.log(chalk.blue.bold(welcomeLines.join("\n")));

// Keep track of the current text rows on screen
let currentLines = [...welcomeLines];

// 3. Type 3 dots one by one on the same line
for (let i = 0; i < 3; i++) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  // Stitch the new dot row horizontally onto the existing text row
  currentLines = currentLines.map(
    (line, index) => line + (dotLines[index] || ""),
  );

  // Move cursor back to the top of the block and clear down to redraw
  process.stdout.moveCursor(0, -welcomeLines.length);
  process.stdout.clearScreenDown();

  // Print the updated text
  console.log(chalk.blue.bold(currentLines.join("\n")));
}

const logo = figlet.textSync("  Audiofy  !", { font: "Larry 3D" });
await new Promise((resolve) => setTimeout(resolve, 500)); // small delay for effect
console.log(chalk.magenta.bold(logo));

// ── TAGLINE ───────────────────────────────────────────────
const tagline = boxen(
  chalk.white("  🎵  Your Audio. Your terminal. Your rules."),
  {
    padding: 0.7,
    margin: 0,
    borderStyle: "arrow",
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
        { name: "📋  Download a playlist", value: "playlist" },
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
