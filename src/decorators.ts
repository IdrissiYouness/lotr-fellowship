//requires exp-decorators to be true in the tsconfig
export function Log(
  target: object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
): void {
  const originalMethod = descriptor.value as (...args: unknown[]) => unknown;

  descriptor.value = function (this: unknown, ...args: unknown[]): unknown {
    console.log(`[CALL] ${String(propertyKey)}`, args);

    try {
      const result = originalMethod.apply(this, args);
      console.log(`[RETURN] ${String(propertyKey)}`, result);
      return result;
    } catch (error: unknown) {
      console.error(`[ERROR] ${String(propertyKey)}`, error);
      throw error;
    }
  };
}

export function MeasureTime(
  target: object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
): void {
  const originalMethod = descriptor.value as (...args: unknown[]) => unknown;

  descriptor.value = function (this: unknown, ...args: unknown[]): unknown {
    const start = Date.now();

    try {
      return originalMethod.apply(this, args);
    } finally {
      console.log(`[TIME] ${String(propertyKey)}: ${Date.now() - start} ms`);
    }
  };
}

export function ValidateAbilityPower(
  target: object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
): void {
  const originalMethod = descriptor.value as (...args: unknown[]) => unknown;

  descriptor.value = function (this: unknown, ...args: unknown[]): unknown {
    const candidate: unknown = args[0];
    if (
      typeof candidate === "object" &&
      candidate !== null &&
      "power" in candidate &&
      typeof candidate.power === "number" &&
      candidate.power < 0
    ) {
      throw new Error("Ability power cannot be negative");
    }

    return originalMethod.apply(this, args);
  };
}
