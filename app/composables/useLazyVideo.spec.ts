import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { defineComponent, ref, nextTick } from 'vue';
import { useLazyVideo } from './useLazyVideo';

describe('useLazyVideo', () => {
  let observeMock: ReturnType<typeof vi.fn>;
  let unobserveMock: ReturnType<typeof vi.fn>;
  let disconnectMock: ReturnType<typeof vi.fn>;
  let intersectionCallback: IntersectionObserverCallback;
  let originalIntersectionObserver: any;

  beforeEach(() => {
    observeMock = vi.fn();
    unobserveMock = vi.fn();
    disconnectMock = vi.fn();

    originalIntersectionObserver = globalThis.IntersectionObserver;

    globalThis.IntersectionObserver = class MockIntersectionObserver implements IntersectionObserver {
      readonly root: Element | Document | null = null;
      readonly rootMargin: string = '';
      readonly thresholds: ReadonlyArray<number> = [];

      constructor(callback: IntersectionObserverCallback) {
        intersectionCallback = callback;
      }
      observe = observeMock;
      unobserve = unobserveMock;
      disconnect = disconnectMock;
      takeRecords = vi.fn();
    } as any;

    // Mock HTMLVideoElement.load
    HTMLVideoElement.prototype.load = vi.fn();
  });

  afterEach(() => {
    globalThis.IntersectionObserver = originalIntersectionObserver;
    vi.restoreAllMocks();
  });

  it('observes provided refs when mounted', async () => {
    const TestComponent = defineComponent({
      template: `
        <div>
          <video ref="video1" class="lazyload">
            <source data-src="video1.mp4" />
          </video>
          <video ref="video2" class="lazyload">
            <source data-src="video2.mp4" />
          </video>
        </div>
      `,
      setup() {
        const video1 = ref<HTMLVideoElement | null>(null);
        const video2 = ref<HTMLVideoElement | null>(null);
        useLazyVideo([video1, video2]);
        return { video1, video2 };
      }
    });

    await mountSuspended(TestComponent);
    await nextTick();

    expect(observeMock).toHaveBeenCalledTimes(2);
  });

  it('falls back to querying document.querySelectorAll when refs are not provided', async () => {
    const TestComponent = defineComponent({
      template: `
        <div>
          <video class="lazyload test-fallback">
            <source data-src="fallback.mp4" />
          </video>
        </div>
      `,
      setup() {
        useLazyVideo();
      }
    });

    const wrapper = await mountSuspended(TestComponent, { attachTo: document.body });
    await nextTick();

    expect(observeMock).toHaveBeenCalledTimes(1);

    const observeCallArg = observeMock.mock.calls[0][0];
    expect(observeCallArg.tagName).toBe('VIDEO');
    expect(observeCallArg.classList.contains('test-fallback')).toBe(true);

    wrapper.unmount();
  });

  it('triggers video load, assigns source, and removes class on intersection', async () => {
    const TestComponent = defineComponent({
      template: `
        <div>
          <video ref="videoRef" class="lazyload">
            <source data-src="intersect.mp4" />
          </video>
        </div>
      `,
      setup() {
        const videoRef = ref<HTMLVideoElement | null>(null);
        useLazyVideo([videoRef]);
        return { videoRef };
      }
    });

    const wrapper = await mountSuspended(TestComponent);
    await nextTick();
    const videoElement = wrapper.vm.videoRef as HTMLVideoElement;

    const sourceElement = videoElement.querySelector('source') as HTMLSourceElement;
    expect(sourceElement.src).toBe('');
    expect(videoElement.classList.contains('lazyload')).toBe(true);
    expect(HTMLVideoElement.prototype.load).not.toHaveBeenCalled();

    // Trigger intersection
    intersectionCallback([{
      isIntersecting: true,
      target: videoElement
    } as unknown as IntersectionObserverEntry], {} as IntersectionObserver);

    expect(sourceElement.src).toContain('intersect.mp4');
    expect(HTMLVideoElement.prototype.load).toHaveBeenCalledTimes(1);
    expect(videoElement.classList.contains('lazyload')).toBe(false);
    expect(unobserveMock).toHaveBeenCalledWith(videoElement);
  });

  it('disconnects on unmount', async () => {
    const TestComponent = defineComponent({
      template: `
        <div>
          <video class="lazyload">
            <source data-src="unmount.mp4" />
          </video>
        </div>
      `,
      setup() {
        useLazyVideo();
      }
    });

    const wrapper = await mountSuspended(TestComponent, { attachTo: document.body });
    await nextTick();

    wrapper.unmount();
    await nextTick();

    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });

  it('does nothing if IntersectionObserver is missing', async () => {
    delete (globalThis as any).IntersectionObserver;

    const TestComponent = defineComponent({
      template: `
        <div>
          <video ref="videoRef" class="lazyload">
            <source data-src="video.mp4" />
          </video>
        </div>
      `,
      setup() {
        const videoRef = ref<HTMLVideoElement | null>(null);
        useLazyVideo([videoRef]);
        return { videoRef };
      }
    });

    await mountSuspended(TestComponent);
    await nextTick();

    expect(observeMock).not.toHaveBeenCalled();
  });
});
