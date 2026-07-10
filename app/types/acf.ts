// Re-export all ACF types from organized files

// WordPress core types
export * from "./wordpress";

// Home page types
export * from "./home";

// Project types
export * from "./project";

// Page types (About, Contact)
export * from "./pages";

// Legacy - for backwards compatibility
export type { HomePageACF as ACFData } from "./home";
