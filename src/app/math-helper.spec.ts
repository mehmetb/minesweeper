import { MathHelper } from './math-helper';

describe('MathHelper', () => {
  it('should create an instance', () => {
    expect(new MathHelper()).toBeTruthy();
  });

  describe('clamp()', () => {
    it('should clamp the values', () => {
      expect(MathHelper.clamp(100, 10, 50)).toBe(50);
      expect(MathHelper.clamp(0, 10, 50)).toBe(10);
      expect(MathHelper.clamp(30, 10, 50)).toBe(30);
    });
  });
});
