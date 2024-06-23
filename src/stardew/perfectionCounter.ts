import { Fish, Shipping } from "./collections.js";
import type { SaveGame } from "./listenForSaves.js";

const FISH_LABELS = Object.keys(Fish).map((item) => `(O)${item}`);

export function percentPerfection(
  perfection: ReturnType<typeof perfectionCounter>
): number {
  // Stardew's perfection system is described here:
  // https://stardewvalleywiki.com/Perfection

  const {
    cookedRecipes,
    craftedRecipes,
    farmerLevel,
    fishCaught,
    stardrops,
    goldClock,
    foundWalnuts,
    friendships,
    monsterSlayer,
    obelisks,
    itemsShipped,
  } = perfection;

  return Math.floor(
    cookedRecipes * 10 +
      craftedRecipes * 10 +
      farmerLevel * 5 +
      fishCaught * 10 +
      stardrops * 10 +
      goldClock * 10 +
      foundWalnuts * 5 +
      friendships * 11 +
      monsterSlayer * 10 +
      obelisks * 4 +
      itemsShipped * 15
  );
}

export function perfectionCounter(saveGame: SaveGame) {
  return {
    cookedRecipes: percentCookedRecipes(saveGame),
    craftedRecipes: percentCraftedRecipes(saveGame),
    farmerLevel: percentFarmerLevels(saveGame),
    fishCaught: percentFishCaught(saveGame),
    stardrops: hasFoundAllStardrops(saveGame) ? 1 : 0,
    goldClock: hasGoldenClock(saveGame) ? 1 : 0,
    foundWalnuts: percentFoundWalnuts(saveGame),
    friendships: percentFriendships(saveGame),
    monsterSlayer: isMonsterSlayerHero(saveGame) ? 1 : 0,
    obelisks: percentObelisks(saveGame),
    itemsShipped: percentItemsShipped(saveGame),
  };
}

function percentCookedRecipes(saveGame: SaveGame): number {
  const recipesTotal = 81;

  return (saveGame.player.recipesCooked.item?.length ?? 0) / recipesTotal;
}

function percentCraftedRecipes(
  saveGame: SaveGame,
  multiplayer = false
): number {
  const craftingRecipesTotal = multiplayer ? 150 : 149;

  return (
    (saveGame.player.craftingRecipes.item?.filter(({ value }) => value.int > 0)
      .length ?? 0) / craftingRecipesTotal
  );
}

function percentFarmerLevels(saveGame: SaveGame): number {
  const maxSkillLevel = 10;
  const {
    combatLevel,
    farmingLevel,
    fishingLevel,
    foragingLevel,
    miningLevel,
  } = saveGame.player;

  return (
    (combatLevel + farmingLevel + fishingLevel + foragingLevel + miningLevel) /
    (5 * maxSkillLevel)
  );
}

function percentFishCaught(saveGame: SaveGame): number {
  const fishTotal = 72;
  const filteredFish = saveGame.player.fishCaught.item?.filter(({ key }) =>
    FISH_LABELS.includes(key.string.toString())
  );

  return (filteredFish?.length ?? 0) / fishTotal;
}

function hasFoundAllStardrops(saveGame: SaveGame): boolean {
  // Found out how to count the stardrops by reading the stardew-checkup
  // source code: https://github.com/MouseyPounds/stardew-checkup
  const stardropLetters = [
    "CF_Fair",
    "CF_Mines",
    "CF_Spouse",
    "CF_Sewer",
    "CF_Statue",
    "CF_Fish",
    "museumComplete",
  ];

  const letters = saveGame.player.mailReceived.string.filter((letter) =>
    stardropLetters.includes(letter)
  );

  return letters.length === stardropLetters.length;
}

function hasGoldenClock(saveGame: SaveGame): boolean {
  return saveGame.constructedBuildings.string.includes("Gold Clock");
}

function percentFoundWalnuts(saveGame: SaveGame): number {
  const walnutsTotal = 130;

  return saveGame.goldenWalnutsFound / walnutsTotal;
}

function percentFriendships(saveGame: SaveGame): number {
  const pointsPerHeart = 250;
  const datable = [
    "Abigail",
    "Alex",
    "Elliott",
    "Emily",
    "Haley",
    "Harvey",
    "Leah",
    "Maru",
    "Penny",
    "Sam",
    "Sebastian",
    "Shane",
  ];
  const nonDatable = [
    "Caroline",
    "Clint",
    "Demetrius",
    "Dwarf",
    "Evelyn",
    "George",
    "Gus",
    "Jas",
    "Jodi",
    "Kent",
    "Krobus",
    "Leo",
    "Lewis",
    "Linus",
    "Marnie",
    "Pam",
    "Pierre",
    "Robin",
    "Sandy",
    "Vincent",
    "Willy",
    "Wizard",
  ];

  function countMaxHearts(maxHearts: number, villagers: string[]): number {
    return (
      saveGame.player.friendshipData.item
        ?.filter(({ key }) => villagers.includes(key.string))
        .map(({ value }) => value.Friendship.Points)
        .reduce(
          (countMaxHearts, friendshipPoints) =>
            (countMaxHearts +=
              friendshipPoints >= maxHearts * pointsPerHeart ? 1 : 0),
          0
        ) ?? 0
    );
  }

  return (
    (countMaxHearts(8, datable) + countMaxHearts(10, nonDatable)) /
    (datable.length + nonDatable.length)
  );
}

const monsterEradicationGoals = {
  // https://stardewvalleywiki.com/Adventurer%27s_Guild#Monster_Eradication_Goals
  slimes: {
    types: ["Green Slime", "Frost Jelly", "Sludge", "Tiger Slime"],
    quantity: 1000,
  },
  voidSpirits: {
    types: ["Shadow Shaman", "Shadow Brute", "Shadow Sniper"],
    quantity: 150,
  },
  bats: {
    types: ["Bat", "Frost Bat", "Lava Bat", "Iridium Bat"],
    quantity: 200,
  },
  skeletons: {
    types: ["Skeleton", "Skeleton Mage"],
    quantity: 50,
  },
  caveInsects: {
    types: [
      "Bug",
      "Cave Fly",
      "Grub",
      "Mutant Fly",
      "Mutant Grub",
      "Armored Bug",
    ],
    quantity: 80,
  },
  duggies: {
    types: ["Duggy", "Magma Duggy"],
    quantity: 30,
  },
  dustSprites: {
    types: ["Dust Spirit"],
    quantity: 500,
  },
  rockCrabs: {
    types: ["Rock Crab", "Lava Crab", "Iridium Crab"],
    quantity: 60,
  },
  mummies: {
    types: ["Mummy"],
    quantity: 100,
  },
  pepperRex: {
    types: ["Pepper Rex"],
    quantity: 50,
  },
  serpents: {
    types: ["Serpent", "Royal Serpent"],
    quantity: 250,
  },
  magmaSprites: {
    types: ["Magma Sprite", "Magma Sparker"],
    quantity: 150,
  },
} satisfies Record<string, { types: string[]; quantity: number }>;

function isMonsterSlayerHero(saveGame: SaveGame): boolean {
  function killedMonsters(types: string[]) {
    return (
      saveGame.player.stats.specificMonstersKilled.item
        ?.filter(({ key }) => types.includes(key.string))
        .map(({ value }) => value.int)
        .reduce((sum, kills) => (sum += kills), 0) ?? 0
    );
  }

  return Object.values(monsterEradicationGoals).every(
    ({ types, quantity }) => killedMonsters(types) >= quantity
  );
}

function percentObelisks(saveGame: SaveGame): number {
  const obelisksTotal = 4;

  return (
    saveGame.constructedBuildings.string.filter((building) =>
      building.endsWith("Obelisk")
    ).length / obelisksTotal
  );
}

function percentItemsShipped(saveGame: SaveGame): number {
  const shippedItems = saveGame.player.basicShipped.item?.filter(
    ({ key, value }) =>
      Object.keys(Shipping).includes(key.string.toString()) && value.int > 0
  );

  return (shippedItems?.length ?? 0) / Object.keys(Shipping).length;
}
