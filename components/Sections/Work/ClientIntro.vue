<template>
  <section class="client-intro step" v-if="project.intro != null">
    <div class="container is-flex">
      <div class="text-section" :class="{'animated': animateIntro}">
        <h3>Client</h3>
        <p>{{project.intro.client_name}}</p>
        <a
          v-if="project.intro.link != null"
          class="animated-border"
          :href="project.intro.link"
          target="_blank">
            Launch Site
        </a>
        <h3>Deliverables</h3>
        <ul>
          <li 
            v-for="(deliverable, index) in project.intro.deliverables"
            :key="index"
          >{{deliverable.item}}</li>
        </ul>
      </div>

      <div class="image-section" :class="{'animated': animateIntro}" v-if="project.intro.image != null">
        <lazy-image
          class='image'
          :hover="false"
          :image="project.intro.image"
          :imageMobile="project.intro.image"
        />
      </div>
    </div>
  </section>
</template>

<script>
  export default {
    name: 'ClientIntro',
    props: ['project', 'animateIntro'],
    components: {
      LazyImage: () => import('@/components/UI/LazyImage')
    }
  }
</script>

<style lang="scss" scoped>
  .client-intro {
    padding: 0;

    .container {
      flex-wrap: wrap;
      justify-content: space-between;
    }

    .text-section {
      height: 100%;
      align-self: flex-end;
      color: black;
      @include fadeInUp;

      h3 {
        font-weight: bold;
        line-height: 3;
        text-transform: uppercase;
      }

      ul {
        list-style-type: none;
        padding: 0;
        margin: 0 0 $gap * 1.5;

        @include media(lg) {
          margin: 0;
        }
      }

      li,
      p {
        @include size(h3);
      }

      a {
        color: $primary;
        font-weight: 600;
        text-decoration: none;
        @include size(h4);
      }

      h3,
      li {
        color: currentColor;
      }
    }

    .image-section {
      @include fadeInUp;
      transition-delay: 0.2s;

      @include media(lg) {
        flex-basis: 70%;
      }

      .image {
        display: block;

        @include media(md) {
          max-height: 50vh;
        }
        img {
          position: relative;
          object-fit: cover;
          object-position: center;
          max-height: 650px;
          width: 100%;
        }
      }
    }

    a {
      position: relative;
      padding: 5px 0;
    }

    a:hover {
      text-decoration: none;
    }

    a:before,
    a:after {
      content: '';
      position: absolute;
      width: 0%;
      height: 2px;
      bottom: -2px;
      background: $primary;
    }

    a:before {
      left: 0;
    }

    a:after {
      right: 0;
      transition: width 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
    }

    a:hover:before {
      width: 100%;
      transition: width 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
    }

    a:hover:after {
      background: transparent;
      width: 100%;
      transition: 0s;
    }
  }
</style>
