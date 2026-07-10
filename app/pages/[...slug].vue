<script setup lang="ts">
defineOptions({ name: "SlugCatchAll" });
// This catch-all route handles multi-segment broken URLs (e.g. /does/not/exist)
</script>

<template>
  <UINotFound />
</template>
