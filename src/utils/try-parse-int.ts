/**
 * If the value is defined returns an int value
 * @param value
 * @returns
 */
export function tryParseInt(value: string | undefined): number | undefined {
  return value ? parseInt(value, 10) : undefined;
}
