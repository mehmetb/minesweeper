export class MathHelper {
  /**
   * Clamps a given number
   * @param value The number to be clamped
   * @param min The lower bound of the result (inclusive)
   * @param max The upper bound of the result (inclusive)
   * @returns
   * `value` if `min` <= `value` <= `max`
   *
   * `min` if `value` < `min`
   *
   * `max` if `max` < `value`
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
