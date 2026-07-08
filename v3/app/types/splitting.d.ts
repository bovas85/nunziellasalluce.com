declare module 'splitting' {
  interface SplittingOptions {
    target?: string | Element | Element[]
    by?: string
    key?: string | null
  }

  interface SplittingResult {
    el: Element
    words?: Element[]
    chars?: Element[]
  }

  interface Splitting {
    (options?: SplittingOptions): SplittingResult[]
  }

  const splitting: Splitting
  export default splitting
}
