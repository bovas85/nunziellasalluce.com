<script setup lang="ts">
// Minimal setup for the new Vue 3 Composition API homepage
const animateHeader = ref(false)

onMounted(() => {
  animateHeader.value = true
})
</script>

<template>
  <main class="home">
    <section class="hero-placeholder">
      <div class="container">
        <h1 :class="{ 'animate-in': animateHeader }">Nunziella Salluce Design</h1>
        <p>Minimal Homepage Scaffolded in Nuxt 3</p>
      </div>
    </section>

    <section class="placeholder-section">
      <h2>Who I Am</h2>
      <p>Content will be ported here...</p>
    </section>

    <section class="placeholder-section">
      <h2>Selected Work</h2>
      <p>Projects will be fetched and ported here...</p>
    </section>
  </main>
</template>

<style scoped>
.home {
  font-family: sans-serif;
  padding: 2rem;
}

.hero-placeholder {
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: #f4a261;
  color: white;
  border-radius: 8px;
  margin-bottom: 2rem;
}

h1 {
  font-size: 3rem;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 1s ease, transform 1s ease;
}

h1.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.placeholder-section {
  padding: 3rem 1rem;
  background: #f9f9f9;
  border: 2px dashed #ddd;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
}
</style>
