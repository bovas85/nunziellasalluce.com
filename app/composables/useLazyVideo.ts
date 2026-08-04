import { onMounted, onUnmounted } from "vue";
import type { Ref } from "vue";

/**
 * Sets up an IntersectionObserver to lazily load videos.
 *
 * @param refs - Template refs for the specific video elements to observe.
 */
export function useLazyVideo(refs?: Ref<HTMLVideoElement | null>[]) {
  let lazyVideoObserver: IntersectionObserver | null = null;

  onMounted(() => {
    if (!import.meta.client || !("IntersectionObserver" in globalThis)) return;

    if (!refs) return;

    const lazyVideos: HTMLVideoElement[] = refs
      .map((r) => r.value)
      .filter((v): v is HTMLVideoElement => v !== null);

    if (lazyVideos.length === 0) return;

    lazyVideoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((video) => {
          if (video.isIntersecting) {
            const sources = (video.target as HTMLVideoElement).querySelectorAll(
              "source",
            );
            for (let i = 0, len = sources.length; i < len; i++) {
              const videoSource = sources[i] as HTMLSourceElement;
              if (videoSource.dataset.src) {
                videoSource.src = videoSource.dataset.src;
              }
            }
            (video.target as HTMLVideoElement).load();
            video.target.classList.remove("lazyload");
            lazyVideoObserver?.unobserve(video.target);
          }
        });
      },
      { rootMargin: "800px 0px" },
    );

    lazyVideos.forEach((v) => lazyVideoObserver!.observe(v));
  });

  onUnmounted(() => {
    lazyVideoObserver?.disconnect();
  });
}
