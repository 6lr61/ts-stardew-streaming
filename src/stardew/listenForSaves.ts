import { watchFile } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { XMLParser } from "fast-xml-parser";

interface StardewDate {
  currentSeason: string;
  dayOfMonth: string;
  year: string;
}

export async function listenForSaves(callback: (date: StardewDate) => void) {
  console.log("Looking for saves in:", process.env.SAVE_DIR);
  const directoryContent = await readdir(process.env.SAVE_DIR, {
    withFileTypes: true,
  });

  directoryContent
    .filter((entry) => entry.isDirectory())
    .forEach((directory) => {
      console.debug("Adding a watcher to file:", directory.name);

      // The save file has the same name as the directory
      const path = join(directory.parentPath, directory.name, directory.name);
      console.debug("Path:", path);

      watchFile(path, { persistent: true }, async () => {
        console.debug("fs.watchFile:", directory.name);

        readCurrentDate(path).then((date) => callback(date));
      });
    });
}

async function readCurrentDate(path: string): Promise<StardewDate> {
  const fileContent = await readFile(path);
  const parser = new XMLParser();
  const data = parser.parse(fileContent);

  return {
    currentSeason: data.SaveGame.currentSeason as string,
    dayOfMonth: data.SaveGame.dayOfMonth as string,
    year: data.SaveGame.year as string,
  };
}
