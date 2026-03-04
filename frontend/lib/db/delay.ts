/**
 * Simulates network/IO delay for mock data.
 * Use in every mock fetch to mimic real async behavior.
 */
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
