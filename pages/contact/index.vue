<template>
  <div class="contact">
    <section class="section hero">
      <div class="container is-flex-column">
          <h1 class="jumbo">Get
            <br />
            in touch
          </h1>
          <h3>Email: 
            <a href="mailto:hello@nunziellasalluce.com?subject=hello">
              hello@nunziellasalluce.com
            </a>
          </h3>

          <div class="contact-form--wrapper" :class="{'animated': $root.showForm}">
            <the-contact-form />
          </div>
      </div>
    </section>
  </div>
</template>

<script>
  import TheContactForm from '@/components/UI/TheContactForm'
  export default {
    components: {
      TheContactForm
    },
    mounted () {
      if (process.browser) {
        setTimeout(() => {
          this.$root.showForm = true
        }, 1000)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .contact {
    section {
      margin: $gap * 1.5 $gap;

      @include media(md) {
        margin: $gap * 3 auto;
      }
      &.hero {
        background: white;
        margin: $gap * 3 0;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        position: relative;
        padding: 0 $gap;

        @include media(sm) {
          padding: 0;
        }

        @include media(md) {
          margin: 0 auto $gap * 3;
        }

        .container {
          height: 100%;
          justify-content: center;
        }

        h1 {
          margin: $gap * 3 0 $gap;

          @include media(sm) {
            max-width: 350px;
            margin: $gap * 9 0 $gap;
          }
        }

        h1,
        h3 {
          color: black;
        }

        h3 {
          margin-bottom: $gap * 3;
        }

        a {
          color: black;
          font-weight: 600;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
      .contact-form--wrapper {
        margin-left: auto;
        min-height: 546px;
        @include fadeInUp;

        &.animated {
          opacity: 1;
        }
      }
    }
  }
</style>
