#!/usr/bin/env node
import fs from "fs";
import chalk from "chalk";
import figlet from "figlet";
import boxen from "boxen";
import inquirer from "inquirer";
import { downloadSong } from "./download.js"; // the real download logic
import { getConfig, saveConfig } from "./config.js";
import { downloadList, downloadYoutubePlaylist } from "./playlist.js";
import { ensureYtDlp } from "./setup.js";
await ensureYtDlp();

// ── LOGO ──────────────────────────────────────────────────

const welcomeLines = figlet
  .textSync("Welcome to", { font: "Slant" })
  .split("\n");

const dotLines = figlet.textSync(" .", { font: "Slant" }).split("\n");

console.log(chalk.blue.bold(welcomeLines.join("\n")));

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

// ── TAGLINE
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

// ── MAIN MENU
// this function shows the main menu and handles what user picks
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
    console.log(chalk.magentaBright.italic("\n  later!, captain:) \n"));
    process.exit(0); // exit the app
  }

  // route to correct handler based on what user picked
  if (action === "song") await handleDownload();
  if (action === "playlist") await handlePlaylist();
  if (action === "settings") await handleSettings();
}

//--handle settings----------------------------------------
async function handleSettings() {
  const { option } = await inquirer.prompt([
    {
      type: "list",
      name: "option",
      message: chalk.cyan("Settings:"),
      choices: [
        { name: "📁  Change save location", value: "location" },
        { name: "🎵  Change audio quality", value: "quality" },
        { name: "⬅️   Back", value: "back" },
      ],
    },
  ]);

  if (option === "back") {
    await mainMenu();
    return;
  }

  if (option === "location") {
    const { outputDir } = await inquirer.prompt([
      {
        type: "input",
        name: "outputDir",
        message: chalk.cyan("Enter new save location:"),
        default: getConfig().outputDir,
        validate: (input) => {
          if (!fs.existsSync(input)) {
            return `Path does not exist: ${input}`;
          }
          return true;
        },
      },
    ]);

    saveConfig({ ...getConfig(), outputDir }); // keeps quality    console.log(chalk.green(`\n  ✅ Saved to: ${outputDir}\n`));
    await handleSettings(); // go back to settings after saving
  }

  if (option === "quality") {
    const { quality } = await inquirer.prompt([
      {
        type: "list",
        name: "quality",
        message: chalk.cyan("Select audio quality:"),
        choices: [
          { name: "🔥  320k (Best)", value: "0" },
          { name: "⚡  192k (Good)", value: "5" },
          { name: "💾  128k (Small)", value: "9" },
        ],
      },
    ]);

    saveConfig({ ...getConfig(), quality });
    console.log(chalk.green("\n  ✅ Quality updated!\n"));
    await handleSettings();
  }
}

// ── HANDLE DOWNLOAD per txt───────────────────────────────────────
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

//--handle playlist download----------------------------------------
async function handlePlaylist() {
  const { method } = await inquirer.prompt([
    {
      type: "list",
      name: "method",
      message: chalk.cyan("How do you want to download?"),
      choices: [
        { name: "📝  Paste a song list", value: "list" },
        { name: "🔗  YouTube playlist URL", value: "url" },
        { name: "⬅️   Back", value: "back" },
      ],
    },
  ]);

  if (method === "back") await mainMenu();
  if (method === "list") await handleList();
  if (method === "url") await handleYoutubePlaylist();
}

//--handle song list----------------------------------------
// user pastes comma or newline separated song names
async function handleList() {
  const { input } = await inquirer.prompt([
    {
      type: "input",
      name: "input",
      message: chalk.cyan("Paste songs (comma or newline separated):"),
      validate: (i) => i.length > 0 || "Please enter at least one song",
    },
  ]);

  // downloadList splits and downloads one by one
  await downloadList(input);
  await mainMenu();
}

//--handle youtube playlist---------------------------------
// user pastes a youtube playlist URL and we download all songs
async function handleYoutubePlaylist() {
  const { url } = await inquirer.prompt([
    {
      type: "input",
      name: "url",
      message: chalk.cyan("Paste YouTube playlist URL:"),
      validate: (i) =>
        i.includes("youtube.com") || "Please enter a valid YouTube URL",
    },
  ]);

  // downloadYoutubePlaylist handles the rest
  await downloadYoutubePlaylist(url);
  await mainMenu();
}

// ── START ─────────────────────────────────────────────────
// kick everything off
mainMenu();
