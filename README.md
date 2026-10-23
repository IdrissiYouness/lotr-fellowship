# Lord of the Rings: Fellowship TS Manager

A TypeScript practice project themed on Middle-earth: generics, utility types, decorators and type guards. Built with [Bun](https://bun.sh).

## Run

```bash
bun install
bun start            # run src/main.ts
bun run typecheck    # type-check (Bun does not do it on its own)
```

## Structure

```
src/
├── types.ts        # types, utility and conditional types
├── repository.ts   # generic Repository<T>
├── decorators.ts   # Log, MeasureTime, ValidateAbilityPower, Cache
└── main.ts         # FellowshipService, type guards, demos
```

## Exercises

| # | Notion | Where |
|---|---|---|
| 1 | `Omit` | `registerHero` |
| 2 | Indexed access type | `HeroRepository.findByRace` |
| 3 | `Extract` | `AbilityUsedEvent` |
| 4 | Method decorator (validation) | `ValidateAbilityPower` |
| 5 | Method decorator (cache) | `Cache` |
| 6 | Type guard | `isHero`, `isRace`, `isFaction` |
