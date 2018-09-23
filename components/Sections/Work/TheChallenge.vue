<template>
  <section class="the-challenge step" v-if="project.challenge != null">
    <div class="container">
      <div class="text-section" :class="{'animated': animateChallenge}">
        <h1>{{project.challenge.title}}</h1>
        <p>
          {{project.challenge.body}}
        </p>
      </div>
      <div class="two-columns">
        <div class="column column--left" :class="{'animated': animateChallenge}">
          <h3>Insights</h3>
          <ul>
            <li
              v-for="(insight, index) in project.challenge.left_list.list_item"
              :key="index"
            >
              {{insight.item}}
            </li>
          </ul>
        </div>
        <div class="column column--right" :class="{'animated': animateChallenge}">
          <h3>Action</h3>
          <ul>
            <li
              v-for="(action, index) in project.challenge.right_list.list_item"
              :key="index"
            >
              {{action.item}}
            </li>
          </ul>
        </div>
      </div>
      <div class="flexible-content container-fluid" v-if="project.challenge.flexible_content.length">
        <div 
          v-for="(content, index) in project.challenge.flexible_content"
          :key="index"
          :class="content.acf_fc_layout"
        >
          <lazy-image
            v-if="content.acf_fc_layout === 'image'"
            class="image"
            :hover="false"
            :image="content.image"
            :imageMobile="content.image"
          />
          <p v-else-if="content.acf_fc_layout === 'text'">{{content.text}}</p>
          <lazy-image
            v-else
            class="double_image"
            :hover="false"
            position="right"
            :image="content.double_image"
            :imageMobile="content.double_image"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script>
  export default {
    name: 'TheChallenge',
    props: ['project', 'animateChallenge'],
    components: {
      LazyImage: () => import('@/components/UI/LazyImage')
    }
  }
</script>

<style lang="scss" scoped>
  .the-challenge {
    overflow: hidden;

    @include media(md) {
      margin-bottom: $gap * 3;
    }

    h1 {
      max-width: 150px;
    }

    .two-columns {
      margin-bottom: $gap * 2;
      @include media(md) {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        justify-content: space-between;
      }
    }
    .column {
      width: 100%;

      @include media(md) {
        width: 48%;
        flex-basis: calc(50% - #{$gap / 2});
      }

      h3 {
        font-weight: bold;
        text-transform: uppercase;
        line-height: 3;
        color: $primary;
      }
      ul {
        list-style-type: none;
        margin: 0;
        padding: 0;

        li {
          @include size(h3);
          padding: 8px 0;
        }
      }

      &--left {
        @include fadeInUp;
        transition-delay: 0.2s;
      }
      &--right {
        @include fadeInUp;
        position: relative;
        background: transparent;
        transition-delay: 0.4s;
        z-index: 1;
        padding: 0 $gap / 1.5 $gap / 1.5;
        margin-top: $gap;

        @include media(md) {
          margin-top: 0;
        }

        &:after {
          content: '';
          position: absolute;
          background: $lightgrey;
          z-index: -1;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0;
          transform: translateX(200%);
          transition: all 0.6s ease-in-out 0.8s;
        }

        &.animated {
          &:after {
            transform: translateX(0);
            opacity: 1;
          }
        }
      }
    }
    .text-section {
      @include fadeInUp;
    }
    .flexible-content {
      display: flex;
      flex-basis: 100%;
      flex-direction: column;
      margin: 0 auto;
      display: grid;
      grid-auto-rows: minmax(1fr, minmax(340px, 680px));

      .image {
        width: 100%;
        margin: $gap auto;

        @supports (display: grid) {
          @include media(md) {
            width: 80%;
            height: 100%;
            margin: 0 auto;
            /deep/ img {
              object-fit: contain !important;
            }
          }
        }
      }

      .double_image {
        grid-column: 1 / -1;

        @include media(lg) {
          grid-column: span 6;
        }
        /deep/ img {
          object-fit: cover;
          object-position: center;
          @supports (display: grid) {
            height: 340px;
          }
        }
      }
      .text {
        margin: $gap 0;
      }
    }
  }
</style>
