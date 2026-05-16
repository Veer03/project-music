import fs from "fs";

const CONFIG_FILE = "config.json";
const DEFAULT_CONFIG = {
  outputDir: "./music",
};

//IT IS JUST...OBV.
export function getConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    return DEFAULT_CONFIG;
  } else {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
  }
}

//SAVE CONFIG
export function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}
