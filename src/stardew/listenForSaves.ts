import { readFileSync, watchFile } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { XMLParser } from "fast-xml-parser";

interface GameData {
  SaveGame: {
    player: {
      basicShipped: {
        item?: { key: { string: number | string }; value: { int: number } }[];
      };
      fishCaught: {
        item?: {
          key: { string: number | string };
          value: { ArrayOfInt: number[] };
        }[];
      };
      friendshipData: {
        item?: {
          key: { string: string };
          value: {
            Friendship: {
              Points: number;
              GiftsThisWeek: number;
              GiftsToday: number;
              LastGiftDate: StardewDate;
              TalkedToToday: boolean;
              ProposalRejected: boolean;
              Status: string;
              Proposer: number;
              RoommateMarriage: boolean;
            };
          };
        }[];
      };
      recipesCooked: {
        item?: { key: { string: number | string }; value: { int: number } }[];
      };
      craftingRecipes: {
        item?: { key: { string: string }; value: { int: number } }[];
      };
      mailReceived: {
        string: string[];
      };
      combatLevel: number;
      farmingLevel: number;
      fishingLevel: number;
      foragingLevel: number;
      miningLevel: number;
      stats: {
        specificMonstersKilled: {
          item?: { key: { string: string }; value: { int: number } }[];
        };
      };
    };
    goldenWalnutsFound: number;
    constructedBuildings: { string: string[] };
    currentSeason: "spring" | "summer" | "fall" | "winter";
    dayOfMonth: string;
    year: string;
  };
}

export type SaveGame = GameData["SaveGame"];

export interface StardewDate {
  currentSeason: "spring" | "summer" | "fall" | "winter";
  dayOfMonth: string;
  year: string;
}

// TODO: Make it so that brand new save files are detected while running
export async function listenForSaves(callback: (gameSave: GameData) => void) {
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
        console.debug("Noticed change in:", directory.name);

        callback(parseGameSave(path));
      });
    });
}

export function parseGameSave(path: string): GameData {
  console.debug("Reading file:", path);
  const fileContent = readFileSync(path);
  const parser = new XMLParser();

  console.debug("Parsing XML");
  return parser.parse(fileContent);
}

export function readCurrentDate(gameData: GameData) {
  const { currentSeason, dayOfMonth, year } = gameData.SaveGame;

  return {
    currentSeason,
    dayOfMonth,
    year,
  };
}
