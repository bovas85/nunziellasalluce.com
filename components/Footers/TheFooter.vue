<template>
  <footer class="footer">
    <div class="container is-flex">
      <div class="left-section is-flex">
        <img src="/images/logo-mobile.jpg" alt="Nunziella Salluce Design logo" />
        <div class="links">
          <p>Email: <a href="mailto:hello@nunziellasalluce.com?subject=Interview request">hello@nunziellasalluce.com</a></p>
          <p>Phone: <a href="tel:+447462636005">+44(0)746 263 6005</a></p>
        </div>
      </div>
      <div class="right-section">
        <div class="social-and-logos">
          <h3>Follow me</h3>
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
      // AppNewsletter: () => import("@/components/UI/AppNewsletter")
    }
  }
</script>

<style lang="scss" scoped>
  footer {
    background-color: $grey;
    color: white;
    padding: $gap 0;

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
      p {
        line-height: 1.5;
        margin-left: $gap / 2;
      }
    }

    .container {
      align-items: center;
      justify-content: space-between;
    }
  }
  .social-list {
    display: flex;
    justify-content: space-between;
    max-width: 200px;
    list-style-type: none;
  }
</style>
