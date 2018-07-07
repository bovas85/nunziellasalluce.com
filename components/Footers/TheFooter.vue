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
          <ul class="social-list social">
              <li class="social__icon">
                  <a href="https://www.facebook.com/" rel="noopener" target="_blank">
                      <i class="fa social__icon--facebook"></i>
                  </a>
              </li>
              <li class="social__icon">
                  <a href="https://twitter.com/" rel="noopener" target="_blank">
                      <i class="fa social__icon--twitter"></i>
                  </a>
              </li>
              <li class="social__icon">
                  <a href="https://www.instagram.com/travel/" rel="noopener" target="_blank">
                      <i class="fa social__icon--instagram"></i>
                  </a>
              </li>
              <li class="social__icon">
                  <a href="https://www.linkedin.com/company/10913867?trk=tyah&trkInfo=clickedVertical%3Acompany%2CclickedEntityId%3A10913867%2Cidx%3A1-1-1%2CtarId%3A1472558078494%2Ctas%3A"
                      rel="noopener" target="_blank">
                      <i class="fa social__icon--linkedin"></i>
                  </a>
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
  .social {
    display: flex;
    justify-content: space-between;
    max-width: 200px;
  }
</style>
