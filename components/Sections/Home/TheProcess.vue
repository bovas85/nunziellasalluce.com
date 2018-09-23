<template>
  <section class="the-process step" v-if="acf">
      <div class="container">
        <h1 :class="{'animated': animateProcess}">{{acf.the_process.title}}</h1>
        <div class="container is-flex">
          <div class="image-grid">
            <div :class="{'animated': animateProcess}"><p>Planning project scope</p></div>
            <div :class="{'animated': animateProcess}"><p>Design</p></div>
            <div :class="{'animated': animateProcess}"><p>Development</p></div>
            <div :class="{'animated': animateProcess}"><p>QA Testing</p></div>
          </div>
        </div>
      </div>
    </section>
</template>

<script>
  export default {
    name: 'TheProcess',
    props: ['acf', 'animateProcess']
  }
</script>

<style lang="scss" scoped>
  .the-process {
    h1 {
      max-width: 200px;
      padding-left: $gap;

      @include media(md) {
        padding-left: 0;
      }
      @include fadeInUp;
    }

    img {
      max-width: 100%;
      width: 100%;
      object-fit: cover;
    }

    .image-grid {
      display: flex;
      display: grid;
      grid-gap: 0;
      grid-template-columns: 1fr;
      grid-template-rows: repeat(18, 1fr);
      width: 100%;
      height: 100%;
      position: relative;

      div {
        border-radius: 100%;
        display: block;
        width: calc(100vw - 90px);
        height: calc(100vw - 90px);
        max-width: 320px;
        max-height: 320px;
        border-radius: 100%;
        background-color: $grey;
        mix-blend-mode: color-burn;
        justify-self: center;
        display: flex;
        justify-content: center;
        align-items: center;
        grid-column: 1 / -1;
        @include fadeInUp;

        @media not all and (min-resolution: 0.001dpcm) {
          mix-blend-mode: multiply;
        }

        p {
          font-size: responsive(18px 21px);
          font-range: 1200px 1440px;
          font-weight: 600;
          text-transform: uppercase;
          max-width: 160px;
          text-align: center;
        }

        &:nth-child(1) {
          grid-row: 1 / 6;
          background-color: #95d3e8;
          transition-delay: 0.2s;
        }
        &:nth-child(2) {
          grid-row: 5 / 10;
          background-color: #ff83c1;
          transition-delay: 0.3s;
        }
        &:nth-child(3) {
          grid-row: 9 / 14;
          background-color: #f9e344;
          transition-delay: 0.4s;
        }
        &:nth-child(4) {
          grid-row: 13 / 18;
          background-color: #b4d27a;
          transition-delay: 0.5s;
        }
      }

      @include media(xl) {
        grid-template-columns: repeat(17, 1fr);
        grid-auto-rows: 274px;
        height: 274px;

        div {
          max-width: unset;
          max-height: unset;
          width: 100%;
          justify-self: start;
          height: 274px;

          p {
            text-align: left;
          }

          &:nth-child(1) {
            grid-row: 1 / 1;
            grid-column: 3 / 7;
          }
          &:nth-child(2) {
            grid-row: 1 / 1;
            grid-column: 6 / 10;
          }
          &:nth-child(3) {
            grid-row: 1 / 1;
            grid-column: 9 / 13;
          }
          &:nth-child(4) {
            grid-row: 1 / 1;
            grid-column: 12 / 16;
          }
        }
      }

      @include media(xxl) {
        grid-auto-rows: 329px;
        height: 329px;

        div {
          height: 329px;
        }
      }
    }
  }
</style>
