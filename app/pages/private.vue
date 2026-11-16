<script setup lang="ts">
import { useAsyncData, useRuntimeConfig } from "#app";
import { useHead, useRequestEvent } from "#imports";
import Config from "@/assets/config";
import scrollama, {
  type ScrollamaInstance,
  type ScrollamaResponse,
} from "scrollama";
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { draftPrivateCaseStudy } from "~/data/private-case-study";
import type { Project, ProjectACF } from "~/types/acf";

defineOptions({ name: "PrivateCaseStudyPage" });

const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const menuScrolled = useState("menuScrolled");

const isRouteEnabled = computed(
  () => runtimeConfig.public?.ENABLE_PRIVATE_CASE_STUDY_ROUTE !== false,
);

// Fetch all projects (to find private if published in WP and resolve prev/next navigation)
const fetchFn =
  (typeof globalThis !== "undefined" && globalThis.$fetch) || $fetch;
const { data: projectsData } = await useAsyncData(
  "projects",
  () => fetchFn(Config.wpDomain + Config.api.projects).catch(() => null),
  {
    getCachedData(key, nuxtApp) {
      return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
    },
  },
);

const publishedProjects = computed(() => {
  if (!projectsData.value) return [];
  return (projectsData.value as Project[]).filter(
    (p) => p.acf?.status === "true",
  );
});

// Resolve the private project: WP-managed if present, otherwise graceful draft/offline fallback
const currentProject = computed<Project>(() => {
  const found = (projectsData.value as Project[] | null)?.find(
    (p) => p.slug === "private",
  );
  return found || draftPrivateCaseStudy;
});

const projectTitle = computed(() => currentProject.value?.slug || "private");

const project = computed<ProjectACF | null>(
  () => currentProject.value?.acf || null,
);

const previousProject = computed<Project | null>(() => {
  if (!publishedProjects.value.length) return null;
  const idx = publishedProjects.value.findIndex((p) => p.slug === "private");
  if (idx > 0) {
    return publishedProjects.value[idx - 1] || null;
  }
  return publishedProjects.value[publishedProjects.value.length - 1] || null;
});

const nextProject = computed<Project | null>(() => {
  if (!publishedProjects.value.length) return null;
  const idx = publishedProjects.value.findIndex((p) => p.slug === "private");
  if (idx >= 0 && idx < publishedProjects.value.length - 1) {
    return publishedProjects.value[idx + 1] || null;
  }
  return publishedProjects.value[0] || null;
});

// Edge auth access verification
const { data: authStatus, refresh: refreshAuth } = await useAsyncData(
  "case-study-auth",
  () => fetchFn("/api/verify-access").catch(() => ({ authenticated: false })),
  {
    default: () => ({ authenticated: false }),
  },
);

const isAuthenticated = ref(Boolean(authStatus.value?.authenticated));

const isGateActive = computed(() => {
  if (route?.query?.preview_gate === "1" || route?.query?.protected === "1") {
    return true;
  }
  return !isAuthenticated.value;
});

const animateHeader = ref(false);
const animateIntro = ref(false);
const animateEmail = ref(false);
const animateDigital = ref(false);
const animateRich = ref(false);
const animateBottomImage = ref(false);

let stepLength = 0;
let scroller: ScrollamaInstance | null = null;

const capitalizeEveryWord = (str: string) => {
  return str.replace(/\b\w/g, (l) => l.toUpperCase());
};

const handleStepEnter = (response: ScrollamaResponse) => {
  if (response.element) {
    response.element.classList.add("animated");
  }
  switch (response.index) {
    case 0:
      menuScrolled.value = false;
      break;
    case 1:
      animateIntro.value = true;
      break;
    case 2:
      animateEmail.value = true;
      break;
    case 3:
      animateDigital.value = true;
      break;
    case 4:
      animateRich.value = true;
      break;
    case stepLength:
      animateBottomImage.value = true;
      break;
    default:
      break;
  }
};

const showMenu = (response: ScrollamaResponse) => {
  if (
    response.index >= 0 &&
    response.direction === "down" &&
    !menuScrolled.value
  ) {
    menuScrolled.value = true;
  }
};

const handleScroll = () => {
  if (!import.meta.client) return;
  const step = document.querySelector(".step");
  if (step) {
    scroller = scrollama();
    scroller
      .setup({
        step: ".step",
        offset: window.innerWidth > 577 ? 0.6 : 0.7,
        debug: false,
      })
      .onStepEnter(handleStepEnter)
      .onStepExit(showMenu);
  }
};

const scrollamaResize = () => {
  if (scroller) scroller.resize();
};

const onUnlocked = async () => {
  isAuthenticated.value = true;
  await refreshAuth();
  if (import.meta.client) {
    animateHeader.value = true;
    await nextTick();
    stepLength = document.querySelectorAll(".step").length - 2;
    handleScroll();
    window.addEventListener("resize", scrollamaResize, { passive: true });
  }
};

if (!isRouteEnabled.value && import.meta.server) {
  const event = useRequestEvent();
  if (event) {
    const { setResponseStatus } = await import("h3");
    setResponseStatus(event, 404);
  }
}

useHead(() => {
  if (!isRouteEnabled.value) {
    return {
      title: "Page Not Found | Nunziella Salluce",
      meta: [{ name: "robots", content: "noindex, nofollow" }],
    };
  }

  if (isGateActive.value) {
    const formattedTitle = projectTitle.value.replaceAll("-", " ");
    const capitalizedTitle = capitalizeEveryWord(formattedTitle);
    return {
      title: `${capitalizedTitle || "Private Case Study"} - Protected | Nunziella Salluce`,
      meta: [{ name: "robots", content: "noindex, nofollow" }],
    };
  }

  if (
    project.value &&
    projectTitle.value &&
    project.value.seo?.facebook?.sizes &&
    project.value.seo?.twitter?.sizes
  ) {
    const formattedTitle = projectTitle.value.replaceAll("-", " ");
    const capitalizedTitle = capitalizeEveryWord(formattedTitle);
    const commaFormattedTitle = projectTitle.value.replaceAll("-", ", ");

    return {
      title: capitalizedTitle,
      meta: [
        { name: "description", content: project.value.seo.description },
        {
          name: "keywords",
          content:
            project.value.keywords ||
            `${formattedTitle}, ${commaFormattedTitle}`,
        },
        {
          hid: "og:title",
          property: "og:title",
          content: capitalizedTitle,
        },
        {
          hid: "og:description",
          property: "og:description",
          content: project.value.seo.description,
        },
        {
          hid: "og:image",
          property: "og:image",
          content: project.value.seo.facebook.sizes.large,
        },
        {
          hid: "twitter:title",
          name: "twitter:title",
          content: capitalizedTitle,
        },
        {
          hid: "twitter:description",
          name: "twitter:description",
          content: project.value.seo.description,
        },
        {
          hid: "twitter:image",
          name: "twitter:image",
          content: project.value.seo.twitter.sizes.large,
        },
      ],
    };
  }

  return { title: "Private Case Study | Nunziella Salluce" };
});

onMounted(async () => {
  if (import.meta.client && isRouteEnabled.value) {
    if (!isGateActive.value) {
      animateHeader.value = true;
      await nextTick();
      stepLength = document.querySelectorAll(".step").length - 2;
      handleScroll();
      window.addEventListener("resize", scrollamaResize, { passive: true });
    }
  }
});

onBeforeUnmount(() => {
  if (scroller) {
    scroller.destroy();
  }
  if (import.meta.client) {
    window.removeEventListener("resize", scrollamaResize);
  }
});
</script>

<template>
  <div v-if="!isRouteEnabled">
    <UINotFound />
  </div>

  <div v-else-if="isGateActive" class="private-gate-wrapper">
    <UICaseStudyPasswordGate
      :project-title="projectTitle"
      @unlocked="onUnlocked"
    />
  </div>

  <div v-else-if="project != null" class="case-study private">
    <SectionsWorkHero :project="project" :animate-header="animateHeader" />

    <SectionsWorkClientIntro :project="project" :animate-intro="animateIntro" />

    <SectionsWorkEmailNewsletter
      :project="project"
      :animate-email="animateEmail"
    />

    <SectionsWorkDigitalInfographics
      :project="project"
      :animate-digital="animateDigital"
    />

    <SectionsWorkRichMedia :project="project" :animate-rich="animateRich" />

    <div
      v-if="previousProject && nextProject"
      class="work-navigation step"
      :class="{ animated: animateBottomImage }"
    >
      <div class="container-fluid is-flex">
        <NuxtLink class="previous" :to="`/${previousProject.slug}`">
          <UILazyImage
            v-if="previousProject.acf?.hero"
            class="image"
            :hover="false"
            :image="previousProject.acf.hero.desktop_bg"
            :image-mobile="previousProject.acf.hero.mobile_bg"
          >
            <span>{{ previousProject.acf.hero.title }}</span>
          </UILazyImage>
          <p>Previous Project</p>
        </NuxtLink>
        <NuxtLink class="next" :to="`/${nextProject.slug}`">
          <UILazyImage
            v-if="nextProject.acf?.hero"
            class="image"
            :hover="false"
            :image="nextProject.acf.hero.desktop_bg"
            :image-mobile="nextProject.acf.hero.mobile_bg"
          >
            <span>{{ nextProject.acf.hero.title }}</span>
          </UILazyImage>
          <p>Next Project</p>
        </NuxtLink>
      </div>
    </div>
  </div>

  <UINotFound v-else />
</template>

<style lang="scss" scoped>
h1 {
  padding-bottom: $gap;

  @include media(sm) {
    padding-bottom: 60px;
    max-width: 280px;
  }
}

section {
  margin: $gap * 1.5 $gap;

  @include media(md) {
    margin: $gap * 3 auto;
  }
}

.case-study {
  &.private {
    .client-intro {
      margin-bottom: 0;
    }
  }
}

.work-navigation {
  margin: $gap * 2 0 $gap * 1.5;
  height: 100%;

  @include fadeInUp;

  transition-delay: 1s;

  p {
    font-size: $font-size;
  }

  .container-fluid {
    justify-content: space-between;
    padding: 0 $gap;
    height: 160px;
    position: relative;
    overflow: hidden;

    @include media(sm) {
      padding: 0;
      margin-left: auto;
    }

    @supports (display: grid) {
      height: 100%;
    }
  }

  :deep(img) {
    padding-top: 0 !important;
  }

  a {
    position: relative;
    bottom: 0;
    height: 100%;
    transition: transform 0.4s ease-in-out;

    &::after {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 1;
      background: rgb(0 0 0 / 40%);
      opacity: 0;
      transition: opacity 0.2s ease-in-out;

      @supports (display: grid) {
        bottom: 18px;
      }
    }

    p {
      font-weight: bold;
      color: black;
      text-decoration: none;
    }

    span {
      @include size(h4);

      color: white;
      max-width: 100px;
      position: absolute;
      pointer-events: none;
      top: 50%;
      left: 50%;
      opacity: 0;
      z-index: 2;
      transition: all 0.4s ease-in-out;
    }

    &.previous {
      text-align: right;

      @include media(md) {
        transform: translateX(-120px);
      }

      span {
        @include media(md) {
          transform: translate(-100%, -50%);
        }
      }
    }

    &.next {
      @include media(md) {
        transform: translateX(120px);
      }

      span {
        @include media(md) {
          transform: translate(100%, -50%);
        }
      }
    }

    @include media(md) {
      &:hover {
        &.next,
        &.previous {
          transform: translateX(0);
        }

        span {
          opacity: 1;
          transform: translate(-50%, -50%);
        }

        &::after {
          opacity: 1;
        }
      }
    }

    :deep(img) {
      display: none;

      @include media(md) {
        display: block;
        width: 250px;
        height: 180px;
        object-fit: cover;
        object-position: center;
        position: relative;
        bottom: 0;
        left: 0;
      }
    }
  }
}
</style>
