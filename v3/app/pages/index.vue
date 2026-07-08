<script setup lang="ts">
import { useAsyncData } from '#app'
import Config from '@/assets/config'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { HomePageACF, Project } from '~/types/acf'

const route = useRoute()

// Fetch data using useAsyncData with caching to prevent back-navigation suspension
const { data: homePage } = await useAsyncData(
  'homePage',
  () => $fetch(Config.wpDomain + Config.api.homePage),
  {
    getCachedData(key, nuxtApp) {
      return nuxtApp.payload.data[key] || nuxtApp.static.data[key]
    }
  }
)

const { data: projects } = await useAsyncData(
  'projects',
  () => $fetch(Config.wpDomain + Config.api.projects),
  {
    getCachedData(key, nuxtApp) {
      return nuxtApp.payload.data[key] || nuxtApp.static.data[key]
    }
  }
)

// State for animations
const animateHeader = ref(false)
const animateWho = ref(false)
const animateWork = ref(false)
const animateProcess = ref(false)
const animateCapab = ref(false)
const animateTestimonials = ref(false)

const acf = computed(() => (homePage.value as Record<string, unknown>)?.acf as HomePageACF | undefined)
const testimonials = computed(() => acf.value?.testimonials?.testimonials || [])

const filteredProjects = computed(() => {
  if (!projects.value || !Array.isArray(projects.value)) return null

  const projectsList = projects.value as Project[]
  const order = acf.value?.case_studies?.order || []
  if (order.length > 0) {
    const orderMap = new Map()
    order.forEach((id: number, index: number) => {
      orderMap.set(id, index)
    })

    const sorted = [...projectsList].sort((a, b) => {
      const indexA = orderMap.has(a.id) ? orderMap.get(a.id) : -1
      const indexB = orderMap.has(b.id) ? orderMap.get(b.id) : -1
      return indexA - indexB
    })

    // remove drafts in production
    if (!import.meta.dev) {
      return sorted.filter(project => project.acf?.status === 'true')
    }
    return sorted
  }
  return null
})

onMounted(() => {
  if (import.meta.client) {
    animateHeader.value = true
    setTimeout(() => {
      animateWho.value = true
      // Also animate work shortly after for now since we haven't implemented full scroll triggers yet
      setTimeout(() => {
        animateWork.value = true
        animateProcess.value = true
        animateCapab.value = true
        animateTestimonials.value = true
      }, 200)

      import('splitting').then(module => {
        module.default()
      })
    }, 150)

    if (route.hash) {
      window.scrollTo(0, 0)
      setTimeout(() => {
        const el = document.querySelector(route.hash)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      }, 600)
    }
  }
})
</script>

<template>
  <main v-if="acf" class="home">
    <SectionsHomeHeroSection :acf="acf" :animate-header="animateHeader" />

    <SectionsHomeWhoIAm :acf="acf" :animate-who="animateWho" />

    <section v-if="projects" id="work" class="projects">
      <SectionsHomeTheWork :filtered-projects="filteredProjects || []" :acf="acf" :animate-work="animateWork" />
    </section>

    <SectionsHomeTheProcess :acf="acf" :animate-process="animateProcess" />
    <SectionsHomeTheCapabilities :acf="acf" :animate-capab="animateCapab" />
    <SectionsHomeTheTestimonials :acf="acf" :testimonials="testimonials" :animate-testimonials="animateTestimonials" />
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
