<template>
  <footer class="footer">
    <div class="container is-flex">
      <div class="left-section is-flex-column">
        <the-logo-static 
          :width="90"
          :height="46"
          :mobileWidth="50"
          :mobileHeight="31"
          static
          fill='#f4a261'
        />
        <div class="links">
          <p>Email: <a href="mailto:hello@nunziellasalluce.com?subject=Interview request">hello@nunziellasalluce.com</a></p>
          <p class="referral-link">Coded with 🧔 by <a href="https://moustachedesign.xyz?referrer=nunziella-salluce-design" target="_blank">Moustache Design</a></p>
        </div>
      </div>
      <div class="right-section">
        <div class="social-and-logos">
          <ul class="social-list">
              <li class="social__icon">
                  <a href="https://dribbble.com/nunziella" class="social social--dribbble" rel="noopener" target="_blank"></a>
              </li>
              <li class="social__icon">
                  <a href="https://www.instagram.com/lucettinas/" class="social social--instagram" rel="noopener" target="_blank"></a>
              </li>
              <li class="social__icon">
                  <a href="https://www.behance.net/nunziellasalluce/" class="social social--behance" rel="noopener" target="_blank"></a>
              </li>
              <li class="social__icon">
                  <a class="social social--linkedin" href="https://www.linkedin.com/in/nunziella-salluce"
                      rel="noopener" target="_blank"></a>
              </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
  export default {
    name: 'TheFooter',
    props: {
      mobilenav: {
        type: Boolean,
        default: true
      }
    },
    components: {
      TheLogoStatic: () => import('@/components/Icons/TheLogoStatic')
    }
  }
</script>

<style lang="scss" scoped>
  footer {
    background-color: $grey;
    color: white;
    padding: $gap;

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

      @include media(sm) {
        flex-basis: unset;
      }
    }
  }
</style>
