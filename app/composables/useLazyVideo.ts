import { onMounted } from "vue";

export function useLazyVideo() {
  onMounted(() => {
    if (import.meta.client) {
      const lazyVideos = Array.from(
        document.querySelectorAll("video.lazyload"),
      ) as HTMLVideoElement[];

      if ("IntersectionObserver" in globalThis) {
        const lazyVideoObserver = new IntersectionObserver(
          (entries, _observer) => {
            entries.forEach((video) => {
              if (video.isIntersecting) {
                const sources = (video.target as HTMLVideoElement).querySelectorAll("source");
                for (let i = 0, len = sources.length; i < len; i++) {
                  const videoSource = sources[i] as HTMLSourceElement;
                  if (videoSource.dataset.src) {
                    videoSource.src = videoSource.dataset.src;
                  }
                }
                (video.target as HTMLVideoElement).load();
                video.target.classList.remove("lazyload");
                lazyVideoObserver.unobserve(video.target);
              }
            });
          },
          { rootMargin: "800px 0px" },
        );

        lazyVideos.forEach((lazyVideo) => {
          lazyVideoObserver.observe(lazyVideo);
        });
      }
    }
  });
}
