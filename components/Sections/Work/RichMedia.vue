<template>
  <section class="rich-media step" v-if="project != null && project.rich_media != null">
    <div class="container is-flex">
      <h1 class="title step">{{rich.title}}</h1>
      <div
        class="content"
        :class="{'hidden': !item.text && !item.image}"
        v-for="(item, index) in rich.the_content"
        :key="`${item.acf_fc_layout}-${index}`"
      >
        <LazyImage
          v-if="item && item.acf_fc_layout && item.acf_fc_layout === 'image'"
          class="image step"
          :hover="false"
          :image="item.image"
          :imageMobile="item.image"
        />
        <p v-else-if="item && item.text" class="text step">{{item.text}}</p>
      </div>
    </div>
  </section>
</template>

<script>
  import LazyImage from '@/components/UI/LazyImage'
  export default {
    name: "RichMedia",
    props: ["project", "animateRich"],
    components: {
      LazyImage
    },
    computed: {
      rich () {
        return this.project.rich_media || null;
      }
    }
  };
</script>

<style lang="scss" scoped>
  .rich-media {
    display: flex;

    .container {
      flex-direction: column;
    }

    .title {
      max-width: 300px;
      @include fadeInUp;
      transition-delay: 0.2s;
    }

    .image {
      @include fadeInUp;
      transition-delay: 0.2s;
    }

    .text {
      display: block;
      max-width: 70vw;
      @include fadeInUp;
    }

    .content {
      &:not(:last-child) {
        margin-bottom: $gap;
      }

      &.hidden {
        display: none;
      }
    }
  }
</style>