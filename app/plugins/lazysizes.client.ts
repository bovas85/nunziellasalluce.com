// Configure lazysizes BEFORE importing it — these must be set on
// window.lazySizesConfig before the module self-initialises.
// NOTE: static `import` is hoisted above all other code, so we must
// use dynamic `import()` to guarantee the config exists first.
const w = window as typeof window & {
  lazySizesConfig?: Record<string, unknown>;
};
w.lazySizesConfig = w.lazySizesConfig || {};
// Start fetching images 800px before they enter the viewport
w.lazySizesConfig.expand = 800;
// Throttle scroll/resize checks every 66ms (~1 frame at 60fps)
w.lazySizesConfig.throttleDelay = 66;
// Don't defer to requestIdleCallback — load immediately
w.lazySizesConfig.ricTimeout = 0;
// Mode 2 = eagerly scan all existing elements on init
w.lazySizesConfig.loadMode = 2;

export default defineNuxtPlugin(async () => {
  await import("lazysizes");
  // lazysizes automatically hooks into elements with class `lazyload`
});
