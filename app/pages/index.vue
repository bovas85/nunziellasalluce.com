<script setup lang="ts">
import { useAsyncData } from "#app";
import Config from "@/assets/config";
import scrollama, {
  type ScrollamaInstance,
  type ScrollamaResponse,
} from "scrollama";
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
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

const orderMap = computed(() => {
  const map = new Map<number, number>();
  const order = acf.value?.case_studies?.order || [];
  order.forEach((id: number, index: number) => {
    map.set(id, index);
  });
  return map;
});

const filteredProjects = computed(() => {
  if (!projects.value || !Array.isArray(projects.value)) return null;

  const projectsList = projects.value as Project[];
  const order = acf.value?.case_studies?.order || [];
  if (order.length > 0) {
    let listToProcess = [...projectsList];

    // remove drafts in production
    if (!import.meta.dev) {
      listToProcess = listToProcess.filter((project) => project.acf?.status === "true");
    }

    const map = orderMap.value;
    return listToProcess.sort((a, b) => {
      const indexA = map.get(a.id) ?? -1;
      const indexB = map.get(b.id) ?? -1;
      return indexA - indexB;
    });
  }
  return null;
});

// Map of step index → animate ref setter
// Indices correspond to the order of .step elements in the DOM:
// 0: HeroSection (skip – already animated on mount)
// 1: WhoIAm
// 2: TheWork (projects)
// 3: TheProcess
// 4: TheCapabilities
// 5: TheTestimonials
// 6: TheAwards
const stepAnimations: Record<number, () => void> = {
  1: () => {
    animateWho.value = true;
  },
  2: () => {
    animateWork.value = true;
  },
  3: () => {
    animateProcess.value = true;
  },
  4: () => {
    animateCapab.value = true;
  },
  5: () => {
    animateTestimonials.value = true;
  },
};

let homeScroller: ScrollamaInstance | null = null;

const handleHomeStepEnter = (response: ScrollamaResponse) => {
  const animate = stepAnimations[response.index];
  if (animate) animate();
};

const scrollamaHomeResize = () => {
  if (homeScroller) homeScroller.resize();
};

onMounted(async () => {
  if (import.meta.client) {
    // Hero is above the fold – animate immediately
    animateHeader.value = true;

    // Wait for DOM to settle before initialising scrollama and splitting
    await nextTick();

    import("splitting").then((module) => {
      module.default();
    });

    homeScroller = scrollama();
    homeScroller
      .setup({
        step: ".home .step",
        offset: window.innerWidth > 577 ? 0.6 : 0.7,
        debug: false,
      })
      .onStepEnter(handleHomeStepEnter);

    window.addEventListener("resize", scrollamaHomeResize, { passive: true });

    if (route.hash) {
      window.scrollTo(0, 0);
      await nextTick();
      const el = document.querySelector(route.hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }
});

onBeforeUnmount(() => {
  if (homeScroller) {
    homeScroller.destroy();
    homeScroller = null;
  }
  if (import.meta.client) {
    window.removeEventListener("resize", scrollamaHomeResize);
  }
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
