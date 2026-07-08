<script setup lang="ts">
import { useAsyncData } from '#app'
import { useHead } from '#imports'
import Config from '@/assets/config'
import { useWindowScroll } from '@vueuse/core'
import scrollama from 'scrollama'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { y: _y } = useWindowScroll()
const menuScrolled = useState('menuScrolled')

// Fetch all projects (to get prev/next properly without Vuex state tracking)
const { data: projectsData } = await useAsyncData(
  'projects',
  () => $fetch(Config.wpDomain + Config.api.projects),
  {
    getCachedData(key, nuxtApp) {
      return nuxtApp.payload.data[key] || nuxtApp.static.data[key]
    }
  }
)

const projects = computed(() => {
  if (!projectsData.value) return []
  return (projectsData.value as Record<string, unknown>[]).filter(p => (p.acf as Record<string, unknown>).status === 'true')
})

const getIndex = computed(() => {
  if (!projects.value.length) return 0
  return projects.value.findIndex(p => route.params.work === p.slug)
})

const projectTitle = computed(() => {
  if (!projects.value.length || !projects.value[getIndex.value]) return ''
  return projects.value[getIndex.value].slug
})

const project = computed(() => {
  if (!projects.value.length || !projects.value[getIndex.value]) return null
  return projects.value[getIndex.value].acf
})

const previousProject = computed(() => {
  if (!projects.value.length) return null
  if (getIndex.value === 0) {
    return projects.value[projects.value.length - 1]
  }
  return projects.value[getIndex.value - 1]
})

const nextProject = computed(() => {
  if (!projects.value.length) return null
  if (getIndex.value === projects.value.length - 1) {
    return projects.value[0]
  }
  return projects.value[getIndex.value + 1]
})

const capitalizeEveryWord = (str: string) => {
  return str.replace(/\b\w/g, l => l.toUpperCase())
}

if (!project.value && import.meta.server) {
  const event = useRequestEvent()
  if (event) {
    import('h3').then(({ setResponseStatus }) => {
      setResponseStatus(event, 404)
    })
  }
}

useHead(() => {
  if (project.value && projectTitle.value && project.value.seo?.facebook?.sizes && project.value.seo?.twitter?.sizes) {
    return {
      title: capitalizeEveryWord(projectTitle.value.replace(/-/g, ' ')),
      meta: [
        { name: 'description', content: project.value.seo.description },
        { name: 'keywords', content: project.value.keywords || `${projectTitle.value.replace(/-/g, ' ')}, ${projectTitle.value.replace(/-/g, ', ')}` },
        { hid: 'og:title', property: 'og:title', content: capitalizeEveryWord(projectTitle.value.replace(/-/g, ' ')) },
        { hid: 'og:description', property: 'og:description', content: project.value.seo.description },
        { hid: 'og:image', property: 'og:image', content: project.value.seo.facebook.sizes.large },
        { hid: 'twitter:title', name: 'twitter:title', content: capitalizeEveryWord(projectTitle.value.replace(/-/g, ' ')) },
        { hid: 'twitter:description', name: 'twitter:description', content: project.value.seo.description },
        { hid: 'twitter:image', name: 'twitter:image', content: project.value.seo.twitter.sizes.large }
      ]
    }
  } else {
    return { title: 'Case Study' }
  }
})

const animateHeader = ref(false)
const animateIntro = ref(false)
const animateBrand = ref(false)
const animateChallenge = ref(false)
const animateFinal = ref(false)
const animateBottomImage = ref(false)

let scroller: unknown

interface ScrollamaResponse {
  element: HTMLElement
  index: number
  direction: string
}

const handleStepEnter = (response: ScrollamaResponse) => {
  if (response.element) {
    response.element.classList.add('animated')
  }
  const length = document.querySelectorAll('.step').length - 2
  switch (response.index) {
    case 0:
      menuScrolled.value = false
      break
    case 1:
      animateIntro.value = true
      break
    case 2:
      animateBrand.value = true
      break
    case 3:
      animateChallenge.value = true
      break
    case 4:
      animateFinal.value = true
      break
    case length:
      animateBottomImage.value = true
      break
    default:
      break
  }
}

const showMenu = (response: ScrollamaResponse) => {
  if (response.index >= 0 && response.direction === 'down' && !menuScrolled.value) {
    menuScrolled.value = true
  }
}

const handleScroll = () => {
  if (!import.meta.client) return
  const step = document.querySelector('.step')
  if (step) {
    scroller = scrollama()
      ; (scroller as { setup: (opts: unknown) => { onStepEnter: (fn: unknown) => { onStepExit: (fn: unknown) => unknown } } }).setup({
        step: '.step',
        offset: window.innerWidth > 577 ? 0.6 : 0.7,
        debug: false
      })
        .onStepEnter(handleStepEnter)
        .onStepExit(showMenu)
  } else {
    setTimeout(() => {
      handleScroll()
    }, 600)
  }
}

const scrollamaResize = () => {
  if (scroller) scroller.resize()
}

onMounted(() => {
  if (import.meta.client) {
    animateHeader.value = true
    setTimeout(() => {
      handleScroll()
    }, 150)
    window.addEventListener('resize', scrollamaResize, { passive: true })
  }
})

onBeforeUnmount(() => {
  if (scroller) {
    scroller.destroy()
  }
  window.removeEventListener('resize', scrollamaResize)
})
</script>

<template>
  <div v-if="project != null" class="case-study">
    <SectionsWorkHero :project="project" :animate-header="animateHeader" />

    <SectionsWorkClientIntro :project="project" :animate-intro="animateIntro" />

    <SectionsWorkTheBrand :project="project" :animate-brand="animateBrand" />

    <SectionsWorkTheChallenge :project="project" :animate-challenge="animateChallenge" />

    <ClientOnly>
      <SectionsWorkFinalProduct :project="project" :animate-final="animateFinal" />
    </ClientOnly>

    <div v-if="previousProject && nextProject" class="work-navigation step" :class="{ animated: animateBottomImage }">
      <div class="container-fluid is-flex">
        <NuxtLink class="previous" :to="`/${previousProject.slug}`">
          <UILazyImage
v-if="previousProject.acf.hero != null" class="image" :hover="false"
            :image="previousProject.acf.hero.desktop_bg" :image-mobile="previousProject.acf.hero.mobile_bg">
            <span>{{ previousProject.acf.hero.title }}</span>
          </UILazyImage>
          <p>Previous Project</p>
        </NuxtLink>
        <NuxtLink class="next" :to="`/${nextProject.slug}`">
          <UILazyImage
v-if="nextProject.acf.hero != null" class="image" :hover="false"
            :image="nextProject.acf.hero.desktop_bg" :image-mobile="nextProject.acf.hero.mobile_bg">
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
