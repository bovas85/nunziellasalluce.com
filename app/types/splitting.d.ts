declare module "splitting" {
  interface SplittingOptions {
    target?: string | Element | Element[];
    by?: string;
    key?: string | null;
  }

  interface SplittingResult {
    el: Element;
    words?: Element[];
    chars?: Element[];
  }

  type Splitting = (options?: SplittingOptions) => SplittingResult[];

  const splitting: Splitting;
  export default splitting;
}

declare global {
  const splitting: (options?: Record<string, unknown>) => unknown[];
  const Splitting: (options?: Record<string, unknown>) => unknown[];
}
