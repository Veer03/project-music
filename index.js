const chalk = require("chalk");
const figlet = require("figlet");

let x = "Hello World!";

console.log(chalk.blue.bold.dim(x));
console.log(chalk.hex("#DEADED").bold.dim("Bold gray!"));

let y = chalk.yellow(figlet.fontsSync("Hello World!"));
figlet(" misiccc", "Larry 3D", (err, txt) => {
  console.log(chalk.blue.bold(txt));
});

// const fonts = [
//   "Slant",..........
//   "Big",
//   "Block",
//   "Banner",
//   "Digital",
//   "Doom",
//   "Epic",
//   "Larry 3D",....
// ];

// fonts.forEach((font) => {
//   console.log(`\n--- ${font} ---`);
//   console.log(figlet.textSync("Music", { font }));
// });
