import {
  FACTIONS,
  RACES,
  type Hero,
  type NewHero,
  type Ability,
  type AbilityUsedEvent,
  type Race,
  type Faction,
  type FellowshipEvent,
  type HeroSummary,
  type HeroUpdate,
  type RaceRenown,
  type FactionRenown,
  type AbilityCategory,
  type AbilityOutput,
  type ArrayElement,
  type AlliedFaction,
  type NonHealingCategory,
} from "./types";

import { HeroRepository, AbilityRepository } from "./repository";
import { Log, Cache } from "./decorators";

function isRace(value: unknown): value is Race {
  return typeof value === "string" && RACES.some(race => race === value);
}

function isFaction(value: unknown): value is Faction {
  return typeof value === "string" && FACTIONS.some(f => f === value);
}

function isHero(value: unknown): value is Hero {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "number" &&
    typeof candidate.name === "string" &&
    isRace(candidate.race) &&
    isFaction(candidate.faction) &&
    typeof candidate.level === "number" &&
    typeof candidate.active === "boolean"
  );
}

// creating a simple service for the adaptation wrap all funcs
class FellowshipService {
  constructor(
    private readonly heroes: HeroRepository,
    private readonly abilities: AbilityRepository
  ) {}

  @Log
  useAbility(heroId: number, abilityId: number): string {
    const hero = this.heroes.findById(heroId);
    const ability = this.abilities.findById(abilityId);

    if (!hero || !ability) {
      throw new Error("Hero or ability not found");
    }

    return `${hero.name} uses ${ability.name}!`;
  }

  // changing the logic to depends on repository instead
  findByRace(race: Race): HeroSummary[] {
    return this.heroes
      .findByRace(race)
      .map(({ id, name, race, faction }) => ({ id, name, race, faction }));
  }

  registerHero(newHero: NewHero): Hero {
    const ids = this.heroes.getAll().map(hero => hero.id);
    const nextId = Math.max(0, ...ids) + 1;

    const hero: Hero = { ...newHero, id: nextId };
    this.heroes.add(hero);

    return hero;
  }

  updateHero(id: number, changes: HeroUpdate): boolean {
    return this.heroes.update(id, changes);
  }

  getAbilityEvents(events: FellowshipEvent[]): AbilityUsedEvent[] {
    return events.filter(
      (event): event is AbilityUsedEvent => event.type === "ability-used"
    );
  }
}

function handleAbilityUsed(event: AbilityUsedEvent): void {
  console.log(`Hero ${event.heroId} used ${event.abilityName}`);
}

class DamageCalculator {
  @Cache
  calculateDamage(basePower: number, multiplier: number): number {
    console.log("Calculating...");
    return basePower * multiplier;
  }
}

// sampling with random data
// note : the level is choosed by me based on the importance of the character and his strengths
const heroes = new HeroRepository();
const abilities = new AbilityRepository();

heroes.add({ id: 1, name: "Frodo Baggins", race: "Hobbit", faction: "Shire", level: 5, active: true, weapon: "Sting" });
heroes.add({ id: 2, name: "Legolas", race: "Elf", faction: "Rivendell", level: 8, active: true });
heroes.add({ id: 3, name: "Gimli", race: "Dwarf", faction: "Erebor", level: 6, active: true });
heroes.add({ id: 4, name: "Aragorn", race: "Man", faction: "Gondor", level: 9, active: true });

abilities.add({ id: 201, name: "Anduril", category: "attack", power: 90 });
abilities.add({ id: 202, name: "Mithril Coat", category: "defense", power: 70 });
abilities.add({ id: 203, name: "Athelas", category: "healing", power: 40 });

const fellowship = new FellowshipService(heroes, abilities);

// testing demos
console.log("\n Use an ability");
console.log(fellowship.useAbility(4, 201));

console.log("\n Find heroes by race");
console.log(fellowship.findByRace("Hobbit"));

console.log("\n Update a hero");
fellowship.updateHero(1, { level: 6 });
console.log(heroes.findById(1));

console.log("\n Register a new hero (NewHero) ");
const eowyn = fellowship.registerHero({
  name: "Eowyn",
  race: "Man",
  faction: "Rohan",
  level: 7,
  active: true,
});
console.log(eowyn);
console.log(fellowship.findByRace("Man"));

//somehow this will raise an error if i delete the 140 line
// @ts-expect-error id is not allowed in NewHero
fellowship.registerHero({ id: 99, name: "Fake", race: "Elf", faction: "Rivendell", level: 1, active: true });


console.log("\n Exe 2: find heroes by race ");
console.log(heroes.findByRace("Hobbit"));
console.log(heroes.findByRace("Elf"));

// @ts-expect-error "Orc" is not a valid Race :) i get it now
heroes.findByRace("Orc");

console.log("\n Exe 3: ability-used handler");
handleAbilityUsed({ type: "ability-used", heroId: 1, abilityName: "Sting" });

// @ts-expect-error a level-up event is not an AbilityUsedEvent
handleAbilityUsed({ type: "level-up", heroId: 2, newLevel: 9 });


console.log("\n Exe 4: validate ability power");
abilities.add({ id: 204, name: "Lembas Bread", category: "healing", power: 50 });

try {
  abilities.add({ id: 205, name: "Cursed Blade", category: "attack", power: -10 });
} catch (error: unknown) {
  console.log("Rejected:", error instanceof Error ? error.message : error);
}

console.log(abilities.getAll().length); //cursed blade rejected


console.log("\n Exe 5: cached method");

//simulating miss and hits calculations
const calculator = new DamageCalculator();

console.log(calculator.calculateDamage(10, 3));
console.log(calculator.calculateDamage(10, 3));
console.log(calculator.calculateDamage(5, 2));


const otherCalculator = new DamageCalculator();
console.log(otherCalculator.calculateDamage(10, 3));

console.log("\n Exe 6: strict type guard");

const validData: unknown = {
  id: 1, name: "Frodo Baggins", race: "Hobbit",
  faction: "Shire", level: 5, active: true,
};

const invalidRace: unknown = {
  id: 2, name: "Gothmog", race: "Orc",
  faction: "Mordor", level: 5, active: true,
};

const invalidFaction: unknown = {
  id: 3, name: "Saruman", race: "Man",
  faction: "Isengard", level: 9, active: true,
};

console.log(isHero(validData));
console.log(isHero(invalidRace));
console.log(isHero(invalidFaction));
console.log(isHero(null));
console.log(isHero({ id: "4" }));

if (isHero(validData)) {
  console.log(`${validData.name}: ${validData.race} / ${validData.faction}`);
}

console.log("\n Type guard");
const unknownHero: unknown = heroes.findById(1);
if (isHero(unknownHero)) {
  console.log(`${unknownHero.name} is a ${unknownHero.race} from ${unknownHero.faction}`);
}

console.log("\n Record utility type");
const raceRenown: RaceRenown = { Hobbit: 100, Elf: 90, Dwarf: 80, Man: 70 };
const factionRenown: FactionRenown = {
  Gondor: 90, Rohan: 80, Rivendell: 95, Mordor: 10, Shire: 70, Erebor: 85,
};
console.log(raceRenown, factionRenown);

console.log("\n Extract ability-used events");
const events: FellowshipEvent[] = [
  { type: "ability-used", heroId: 1, abilityName: "Sting" },
  { type: "level-up", heroId: 2, newLevel: 9 },
  { type: "hero-fallen", heroId: 3 },
];
console.log(fellowship.getAbilityEvents(events));

// demos at compile time to check types
type UseArguments = Parameters<FellowshipService["useAbility"]>;
type UseResult = ReturnType<FellowshipService["useAbility"]>;
type AttackOutput = AbilityOutput<"attack">;
type HealingOutput = AbilityOutput<"healing">;
type AbilityItem = ArrayElement<Ability[]>;
type Remaining = NonHealingCategory;
type Allies = AlliedFaction;
type AnyCategory = AbilityCategory;

const typeExamples:
  | [UseArguments, UseResult, AttackOutput, HealingOutput, AbilityItem, Remaining, Allies, AnyCategory]
  | null = null;

void typeExamples;
