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

// importing all the libraries we need
import chalk from "chalk";
import figlet from "figlet";
import boxen from "boxen";
import inquirer from "inquirer";
import { downloadSong } from "./download.js"; // the real download logic
import { ensureYtDlp } from "./setup.js";
await ensureYtDlp();
// ── LOGO ──────────────────────────────────────────────────
// split "Welcome to" into individual rows so we can animate dots onto it
const welcomeLines = figlet
  .textSync("Welcome to", { font: "Slant" })
  .split("\n");

// split a single dot into rows too so we can stitch it horizontally
const dotLines = figlet.textSync(" .", { font: "Slant" }).split("\n");

console.log(chalk.blue.bold(welcomeLines.join("\n")));

// keep track of current text on screen so we can redraw it
let currentLines = [...welcomeLines];

for (let i = 0; i < 3; i++) {
  await new Promise((resolve) => setTimeout(resolve, 500)); // wait 500ms

  // stitch the dot onto each row horizontally
  currentLines = currentLines.map(
    (line, index) => line + (dotLines[index] || ""),
  );

  // move cursor back up to top of the text block
  process.stdout.moveCursor(0, -welcomeLines.length);
  // clear everything below cursor
  process.stdout.clearScreenDown();
  // redraw with new dot added
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
    borderStyle: "arrow", // arrow style border
    borderColor: "magenta",
  },
);
console.log(tagline);

// ── MAIN MENU ─────────────────────────────────────────────
// this function shows the main menu and handles what user picks
async function mainMenu() {
  const { action } = await inquirer.prompt([
    {
      type: "list", // arrow key selectable list
      name: "action", // variable name to store answer
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
    console.log(chalk.magentaBright.italic("\n  later!, captain:) \n"));
    process.exit(0); // exit the app
  }

  // route to correct handler based on what user picked
  if (action === "song") await handleDownload();
  if (action === "playlist") await mainMenu(); // placeholder for now
  if (action === "settings") await mainMenu(); // placeholder for now
}

// ── HANDLE DOWNLOAD ───────────────────────────────────────
// asks user for song name then calls the real download function
async function handleDownload() {
  const { songName } = await inquirer.prompt([
    {
      type: "input", // text input
      name: "songName",
      message: chalk.cyan("Enter song name + artist:"),
      validate: (input) => input.length > 0 || "Please enter a song name", // cant be empty
    },
  ]);

  // call the real download logic from download.js
  await downloadSong(songName);

  // go back to main menu after download
  await mainMenu();
}

// ── START ─────────────────────────────────────────────────
// kick everything off
mainMenu();
