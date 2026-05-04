import { describe, expect, it } from 'vitest';

describe('Vitest Setup Test', () => {
  it('should work correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have access to vitest globals', () => {
    expect(expect).toBeDefined();
    expect(describe).toBeDefined();
    expect(it).toBeDefined();
  });
});
