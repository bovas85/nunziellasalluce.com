<script setup lang="ts">
import { useAsyncData } from "#app";
import Config from "@/assets/config";
import scrollama, {
  type ScrollamaInstance,
  type ScrollamaResponse,
} from "scrollama";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import type { HomePageACF, Project } from "~/types/acf";

defineOptions({ name: "IndexPage" });

const route = useRoute();

// Fetch data using useAsyncData with caching to prevent back-navigation suspension
const { data: homePage } = await useAsyncData(
  "homePage",
  () => $fetch(Config.wpDomain + Config.api.homePage),
  {
    getCachedData(key, nuxtApp) {
      return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
    },
  },
);

const { data: projects } = await useAsyncData(
  "projects",
  () => $fetch(Config.wpDomain + Config.api.projects),
  {
    getCachedData(key, nuxtApp) {
      return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
    },
  },
);

// State for animations
const animateHeader = ref(false);
const animateWho = ref(false);
const animateWork = ref(false);
const animateProcess = ref(false);
const animateCapab = ref(false);
const animateTestimonials = ref(false);

const acf = computed(
  () =>
    (homePage.value as Record<string, unknown>)?.acf as HomePageACF | undefined,
);
const testimonials = computed(
  () => acf.value?.testimonials?.testimonials || [],
);

let scroller: ScrollamaInstance | null = null;
let scrollTimeout: NodeJS.Timeout | null = null;

const handleStepEnter = (response: ScrollamaResponse) => {
  const el = response.element;
  if (el.classList.contains("who-i-am")) {
    animateWho.value = true;
  } else if (el.classList.contains("projects")) {
    animateWork.value = true;
  } else if (el.classList.contains("the-process")) {
    animateProcess.value = true;
  } else if (el.classList.contains("capabilities")) {
    animateCapab.value = true;
  } else if (el.classList.contains("testimonials")) {
    animateTestimonials.value = true;
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
      .onStepEnter(handleStepEnter);
  } else {
    scrollTimeout = setTimeout(() => {
      handleScroll();
    }, 600);
  }
};

const scrollamaResize = () => {
  if (scroller) scroller.resize();
};

const filteredProjects = computed(() => {
  if (!projects.value || !Array.isArray(projects.value)) return null;

  const projectsList = projects.value as Project[];
  const order = acf.value?.case_studies?.order || [];
  if (order.length > 0) {
    const orderMap = new Map();
    order.forEach((id: number, index: number) => {
      orderMap.set(id, index);
    });

    const sorted = [...projectsList].sort((a, b) => {
      const indexA = orderMap.has(a.id) ? orderMap.get(a.id) : -1;
      const indexB = orderMap.has(b.id) ? orderMap.get(b.id) : -1;
      return indexA - indexB;
    });

    // remove drafts in production
    if (!import.meta.dev) {
      return sorted.filter((project) => project.acf?.status === "true");
    }
    return sorted;
  }
  return null;
});

onMounted(() => {
  if (import.meta.client) {
    animateHeader.value = true;
    setTimeout(() => {
      handleScroll();

      import("splitting").then((module) => {
        module.default();
      });
    }, 150);

    window.removeEventListener("resize", scrollamaResize);
    window.addEventListener("resize", scrollamaResize, { passive: true });

    if (route.hash) {
      window.scrollTo(0, 0);
      setTimeout(() => {
        const el = document.querySelector(route.hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 600);
    }
  }
});

onBeforeUnmount(() => {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  if (scroller) {
    scroller.destroy();
  }
  window.removeEventListener("resize", scrollamaResize);
});
</script>

<template>
  <main v-if="acf" class="home">
    <SectionsHomeHeroSection :acf="acf" :animate-header="animateHeader" />

    <SectionsHomeWhoIAm :acf="acf" :animate-who="animateWho" />

    <section v-if="projects" id="work" class="projects">
      <SectionsHomeTheWork
        :filtered-projects="filteredProjects || []"
        :acf="acf"
        :animate-work="animateWork"
      />
    </section>

    <SectionsHomeTheProcess :acf="acf" :animate-process="animateProcess" />
    <SectionsHomeTheCapabilities :acf="acf" :animate-capab="animateCapab" />
    <SectionsHomeTheTestimonials
      :acf="acf"
      :testimonials="testimonials"
      :animate-testimonials="animateTestimonials"
    />
    <SectionsHomeTheAwards />
  </main>
</template>

<style lang="scss" scoped>
@import "@/assets/css/splitting.css";

h1 {
  @include media(sm) {
    max-width: 480px;
    padding-left: 0;
  }
}

section {
  margin: calc($gap / 1.5) 0;
  width: 100%;

  @include media(md) {
    margin: $gap * 3 auto;
  }
}
</style>
