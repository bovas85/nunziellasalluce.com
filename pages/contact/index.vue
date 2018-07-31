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

            <div class="contact-form">
              <the-contact-form />
            </div>
        </div>
      </section>
    </div>
</template>

<script>
  export default {
    components: {
      TheContactForm: () => import('@/components/UI/TheContactForm')
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
        margin: 0;

        @include media(md) {
          margin: 0 auto $gap * 3;
        }

        height: 100%;
        margin: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        position: relative;
        padding: 0 $gap;

        @include media(sm) {
          padding: 0;
        }

        .container {
          height: 100%;
          justify-content: center;
        }

        h1 {
          margin: $gap * 3 0 $gap;

          @include media(sm) {
            max-width: 350px;
            margin: $gap * 6 0 $gap;
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
    }
  }
</style>
