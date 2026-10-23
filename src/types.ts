export const RACES = ["Hobbit", "Elf", "Dwarf", "Man"] as const;
export type Race = (typeof RACES)[number];

export const FACTIONS = [
  "Gondor",
  "Rohan",
  "Rivendell",
  "Mordor",
  "Shire",
  "Erebor",
] as const;
export type Faction = (typeof FACTIONS)[number];

export interface Hero {
  id: number;
  name: string;
  race: Race;
  faction: Faction;
  level: number;
  active: boolean;
  weapon?: string;
}

export type AbilityCategory = "attack" | "defense" | "healing";

export interface Ability {
  id: number;
  name: string;
  category: AbilityCategory;
  power: number;
}

export interface AbilityStats {
  [abilityName: string]: number;
}

export type FellowshipEvent =
  | { type: "ability-used"; heroId: number; abilityName: string }
  | { type: "level-up"; heroId: number; newLevel: number }
  | { type: "hero-fallen"; heroId: number };

export type AbilityUsedEvent = Extract<FellowshipEvent, { type: "ability-used" }>;

export type AbilityOutput<T extends AbilityCategory> =
  T extends "attack" ? number :
  T extends "defense" ? boolean :
  T extends "healing" ? string :
  never;


export type ArrayElement<T> = T extends (infer Item)[] ? Item : never;

export type NewHero = Omit<Hero, "id">;
export type HeroSummary = Pick<Hero, "id" | "name" | "race" | "faction">;
export type HeroUpdate = Partial<Hero>;

export type NonHealingCategory = Exclude<AbilityCategory, "healing">;
export type AlliedFaction = Exclude<Faction, "Mordor">;
export type RaceRenown = Record<Race, number>;
export type FactionRenown = Record<Faction, number>;
