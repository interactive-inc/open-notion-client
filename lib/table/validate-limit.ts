export function validateLimit(limit: number): number {
  if (!Number.isSafeInteger(limit) || limit < 0) {
    throw new RangeError("limit must be a non-negative safe integer")
  }

  return limit
}
