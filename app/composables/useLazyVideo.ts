import { onMounted, onUnmounted } from "vue";

export function useLazyVideo() {
  let lazyVideoObserver: IntersectionObserver | null = null;

  onMounted(() => {
    if (import.meta.client && "IntersectionObserver" in globalThis) {
      const lazyVideos = Array.from(
        document.querySelectorAll("video.lazyload"),
      ) as HTMLVideoElement[];

      lazyVideoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((video) => {
            if (video.isIntersecting) {
              const sources = (
                video.target as HTMLVideoElement
              ).querySelectorAll("source");
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

      lazyVideos.forEach((lazyVideo) => {
        lazyVideoObserver!.observe(lazyVideo);
      });
    }
  });

  onUnmounted(() => {
    lazyVideoObserver?.disconnect();
  });
}
