<template>
  <footer class="footer">
    <div class="container is-flex">
      <div class="left-section is-flex-column">
        <nuxt-link to="/">
          <TheLogoStatic
            :width="90"
            :height="48"
            :mobileWidth="50"
            :mobileHeight="48"
            static
            fill="#f4a261"
          />
        </nuxt-link>
        <div class="links">
          <span>
            <nuxt-link to="/privacy-policy">Privacy Policy</nuxt-link>
          </span>
          <p class="referral-link">
            Coded with 👨 by
            <a
              href="https://moustachedesign.xyz?referrer=nunziella-salluce-design"
              target="_blank"
              rel="noopener"
            >Moustache Design</a>
          </p>
        </div>
      </div>
      <badge/>
      <div class="right-section">
        <div class="social-and-logos">
          <ul class="social-list">
            <li class="social__icon">
              <a
                href="https://dribbble.com/nunziella"
                class="social social--dribbble"
                rel="noopener"
                aria-label="Go to dribble"
                target="_blank"
              ></a>
            </li>
            <li class="social__icon">
              <a
                href="https://www.instagram.com/lucettinas/"
                class="social social--instagram"
                rel="noopener"
                aria-label="Go to instagram"
                target="_blank"
              ></a>
            </li>
            <li class="social__icon">
              <a
                href="https://www.behance.net/nunziellasalluce/"
                class="social social--behance"
                rel="noopener"
                aria-label="Go to behance"
                target="_blank"
              ></a>
            </li>
            <li class="social__icon">
              <a
                class="social social--linkedin"
                href="https://www.linkedin.com/in/nunziella-salluce"
                rel="noopener"
                aria-label="Go to linkedin"
                target="_blank"
              ></a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
  export default {
    name: "TheFooter",
    components: {
      TheLogoStatic: () => import("@/components/Icons/TheLogoStatic"),
      Badge: () => import("./Badge")
    }
  };
</script>

<style lang="scss" scoped>
  footer {
    background-color: $grey;
    color: white;
    padding: $gap;
    position: relative;
    overflow: hidden;

    .container {
      align-items: space-between;
      justify-content: flex-start;
      flex-direction: column;

      @include media(sm) {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }

    @include media(sm) {
      padding: $gap 0;
    }

    img {
      object-fit: contain;
      width: 60px;
      height: 60px;
    }

    .links {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: space-around;
      margin-top: $gap / 4;

      a {
        color: white;
        text-decoration: none;
        font-weight: 600;
        transition: color 0.3s ease-in-out;

        &:hover {
          color: $primary;
        }
      }

      p {
        line-height: 1.5;
        margin-top: $gap / 2.5;

        &.referral-link {
          font-size: $font-size;
        }
      }
    }

    .left-section {
      flex-basis: 100%;

      .nuxt-link,
      .nuxt-link-exact,
      .nuxt-link-exact-active {
        max-width: 100px;
      }

      @include media(sm) {
        flex-basis: unset;
      }
    }
  }
</style>
