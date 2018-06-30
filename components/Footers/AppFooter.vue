<template>
  <footer class="footer">

    <div class="footer-section">

      <div class="container is-gapless main-footer">
        <div class="top-logo">
          <img class="big-logo" src="/images/footer/ant_footer_logobig.svg" alt=" Logo">
        </div>

        <div class="mobile-cta is-hidden-tablet">
          <div class="mobile-button">
            <nuxt-link to="/contact">Contact</nuxt-link>
          </div>
        </div>

        <div class="middle-section grid-wrapper is-gapless">

          <div class="left-col hidden-mobile is-hidden-mobile-large-only is- col--4">
            <h2>ADDRESS</h2>
            <p class="grey">
                6 Morie Street, SW18 1SL<br>
                London, United Kingdom
            </p>
            <h2>TELEPHONE</h2>
            <p class="grey telephone">
                <a href="tel:+442070963477">
                    +44 (0)20 7096 3477
                </a>
            </p>
          </div>


          <div class="newsletter-col col--12-mobile col--4-tablet">
              <h2>NEWSLETTER</h2>
              <p class="grey">
                  Sign up below to receive the  newsletter and occasional updates from our Travel Journal
              </p>
              <div class="input-container">
                  <app-newsletter footer></app-newsletter>
              </div>
          </div>
          <div class="social-and-logos grid-wrapper col--12-mobile col--4-tablet">
            <h2>SOCIAL</h2>
            <ul class="social social-list-mobile">
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
            <div class="accept">
                <h2>WE ACCEPT</h2>
                <div class="card-logos">
                    <img src="/images/footer/ant_footer_visa.svg" alt="Visa">
                    <img src="/images/footer/ant_footer_mastercard.svg" alt="Mastercard">
                    <img src="/images/footer/ant_footer_americanexpress.svg" alt="American Express">
                </div>
            </div>
          </div>

        </div> <!-- middle-section -->


        <div class="col--12-mobile col--6-desktop">
            <div class="m-left-list">
                <ul>
                    <li>
                        <nuxt-link to="/">Home</nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="/about" class="aboutlink">About</nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="/journal">The Journal</nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="/contact">Contact</nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="/privacy-policy" class="privacylink">Privacy policy</nuxt-link>
                    </li>
                    <li>
                        <nuxt-link to="/financial-protection">Financial Protection</nuxt-link>
                    </li>
                </ul>

            </div>
        </div>

        <div class="col--12-mobile col--6-desktop">
            <div class="m-right-list">
                <div class="text">
                    <p class="grey">&copy; 2016 -
                        <span id="date"> {{ new Date().getFullYear('yy') }}</span>  Ltd.
                        <br class="block-m none-l"> Registered Company No. 10100697</p>
                    <p class="grey">An <a href="https://nakedideas.com/" rel="noopener" target="_blank">Intelligent design</a> by Naked Ideas</p>
                </div>
                <nuxt-link to="financial-protection">
                    <img src="/images/footer/atol.svg" alt="Protected by Atol">
                </nuxt-link>
            </div>
        </div>

      </div> <!-- container -->
     </div> <!-- footer-section -->
  </footer>
</template>

<script>
  export default {
    name: "AppFooter",
    props: {
      mobilenav: {
        type: Boolean,
        default: true
      }
    },
    components: {
      AppNewsletter: () => import("@/components/UI/AppNewsletter")
    }
  };
</script>

<style lang="scss" scoped>
  .footer {
    @media (min-width: $tablet) {
      padding-left: 15px;
      padding-right: 15px;
      margin-left: auto;
      margin-right: auto;
    }
    .icon {
      text-align: center;
      padding: 20px 0 20px 0;

      .i-_brand_icon {
        display: inline-block;
        transition: all 0.5s ease-out;

        &:hover {
          transform: scale(1.1);
        }
      }
    }

    .border-top {
      border-top: 1px solid #4c4c4c;
    }

    .border-bottom {
      border-bottom: 1px solid #4c4c4c;

      li {
        width: 25%;
        float: left;

        &:last-child {
          text-align: right;
        }
      }
    }

    .grey {
      color: $lightgrey;
      a {
        text-decoration: none;
        color: inherit;
        border-bottom: 1px solid $lightgrey;
      }
    }

    .grey-no-padding {
      padding: 0 !important;
    }

    ul {
      text-transform: uppercase;
      text-align: justify;
      line-height: 0;
      margin: 0;

      &:after {
        content: "";
        display: inline-block;
        width: 100%;
      }

      li {
        display: inline-block;
        line-height: 100%;
        padding: 20px 0 16px 0;
        @media (min-width: $desktop) {
          padding: 0;
        }

        a {
          color: white;
          text-decoration: none;
          &:hover {
            color: $grey;
          }
        }

        span {
          display: inline-block;
        }
      }
    }

    .newsletter {
      p {
        margin: 0;
        padding: 17px 0 13px 0;
        text-transform: uppercase;
      }

      .input-container {
        position: relative;
        display: flex;
        margin: 0 auto;
        justify-content: center;
        input {
          color: #ffffff;
          background-color: transparent;
          border: solid 1px #979797;
          width: 100%;
          height: 40px;
          padding-right: 70px;
        }

        button {
          cursor: pointer;
          width: 60px;
          height: 40px;
          position: absolute;
          top: 0;
          right: 0;
          padding: 3px 15px 0 0px;
          background-color: transparent;
          border: none;
          color: #ffffff;
          outline: none;
        }
      }
    }

    .terms {
      text-align: center;

      p {
        margin: 0;
        padding: 0;

        &.terms {
          text-transform: uppercase;
          padding: 42px 0 8px 0;
          a {
            color: inherit;
            text-decoration: none;
            &:hover {
              color: $grey;
            }
          }
        }

        &.copyright {
          padding: 0 0 17px 0;
        }

        &.designed {
          padding: 0 0 23px 0;
          a {
            color: $lightgrey;
          }
        }
      }
    }

    .footer-l-wrapper {
      &.active {
        padding-bottom: 31px;
      }

      .input-container {
        display: none;
        position: relative;

        input {
          color: #ffffff;
          background-color: transparent;
          border: solid 1px #979797;

          height: 40px;
          font-size: 14px;
          padding-right: 70px;
        }
        // input:-webkit-autofill {
        //   -webkit-box-shadow: 0 0 0px 1000px #00172c inset;
        // }

        button {
          cursor: pointer;
          width: 60px;
          height: 50px;
          position: absolute;
          top: 0;
          right: 0;
          text-transform: capitalize;
          padding: 0 15px 0 0px;
          font-size: 12px;
          letter-spacing: 1.6px;
          background-color: transparent;
          border: none;
          color: #ffffff;
          outline: none;
          @media (min-width: $desktop) {
            height: 40px;
          }
          &:hover {
            color: #979797;
          }
        }
      }
    }

    .hidden-tablet {
      @media (min-width: $tablet) {
        display: none;
      }
      .row {
        margin: 32px 0;
      }
      .col-12 {
        padding: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: white;
        a {
          font-size: 14px;
          letter-spacing: 1px;
          text-transform: uppercase;
          width: 100%;
          padding: 15px;
          background: white;
          border: 1px solid #000d19;
          border-radius: 2px;
          text-align: center;
          color: #000d19;
          text-decoration: none;
        }
      }
      .container {
        background: white;
        padding: 10px;
      }
      border-bottom: 1px solid white;
    }

    .m-left-list {
      width: 100%;
      @media (min-width: $tablet) {
        display: block;
        overflow: hidden;
      }
      ul {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        margin: 32px auto 0;
        float: none;
        text-align: left;
        width: 100%;
        @media (min-width: $tablet) {
          margin: 32px auto;
          justify-content: center;
          li {
            padding-right: 14px;
            a {
              cursor: pointer;
              &.active {
                color: $red;
              }
            }
          }
        }
        @media (min-width: $desktop) {
          display: flex;
          justify-content: flex-start;
          padding-bottom: 21px;
          padding-top: 32px;
          margin: 0;
          li {
            padding-right: 40px;
          }
        }
      }

      p {
        margin: 0;
        padding: 0;
      }
    }

    #m-mid-list {
      .icon {
        padding-bottom: 26px;
        padding-top: 30px;
      }
    }
    #m-mid-right {
      padding-right: 0;
    }
    .m-right-list {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 32px 0 20px;
      @media (min-width: $tablet) {
        margin-top: 0;
      }
      @media (min-width: $desktop) {
        .none-l {
          display: none;
        }
      }
      .text {
        padding-top: 10px;
        p {
          text-align: center;
        }
      }
      img {
        margin: 20px auto;
        @media (min-width: $desktop) {
          margin: 0;
        }
      }
      @media (min-width: $desktop) {
        flex-direction: row;
        justify-content: flex-end;
        .text p {
          text-align: right;
        }
        img {
          margin: 20px 0;
          margin-left: 20px;
          @media (min-width: $desktop) {
            margin: 0;
            margin-left: 20px;
          }
        }
      }

      ul {
        text-align: right !important;
        @media (min-width: $tablet) {
          padding-bottom: 20px;
          li {
            padding-left: 14px;
            a {
              cursor: pointer;

              &.active {
                color: $red;
              }
            }
          }
        }
        @media (min-width: $desktop) {
          padding-bottom: 21px;
          padding-top: 30px;
          justify-content: flex-end;
          img {
            margin: 0;
            margin-left: 20px;
          }
          li {
            padding-left: 40px;
          }
        }
      }

      p {
        text-align: right;
        margin: 0;
        padding: 0;
        a {
          color: $lightgrey;
        }
      }
    }

    form {
      input {
        &.error {
          border: 1px solid #ff0000 !important;
        }
      }
    }

    @media (min-width: $desktop) {
      .main-logo-large .i-_brand_icon {
        background-size: 100px;
        width: 110px;
        height: 130px;
      }
    }
    .m-left-list ul {
      &:after {
        display: none;
      }
      li:not(:last-child) {
        margin-right: 20px;
        padding: 0;
        white-space: nowrap;
        padding-bottom: 10px;
        @media (min-width: $tablet) {
          padding-bottom: 0;
        }
      }
      li:last-child {
        padding: 0;
        margin-right: 0;
        white-space: nowrap;
      }
    }
    .middle-section {
      text-align: center;
      padding: 30px 0 10px;
      .row {
        display: flex;
        flex-direction: column;
        align-items: center;
        @media (min-width: $tablet) {
          display: block;
        }
      }
      @media (min-width: $tablet) {
        padding: 30px 0;
      }

      h2 {
        font-size: 12px;
        font-weight: bold;
        line-height: normal;
        letter-spacing: 1.5px;
        text-align: center;
        color: #ffffff;
      }
      p {
        font-size: 14px;
        font-stretch: normal;
        line-height: 1.14;
        letter-spacing: normal;
        text-align: center;
        color: #91979d;
      }
      .address-col {
        display: none;
        @media (min-width: $tablet) {
          display: block;
          a {
            text-decoration: none;
            color: currentColor;
            border-bottom: none;
          }
          p {
            margin-bottom: 20px;
          }
        }
      }
      .newsletter-col {
        grid-row-gap: 0;
        p {
          margin-bottom: 0px;
          @media (min-width: $tablet) {
            max-width: 300px;
            margin: 0 auto;
          }
        }
        form {
          position: relative;
          width: 100%;
          margin: 0 auto;
          @media (min-width: $desktop) {
            width: 270px;
          }
        }
        input {
          background-color: #252d34;
          border: none;
          padding: 5px 10px;
          padding-right: 65px;
          width: 100%;
          height: 50px;
          .button {
            height: 50px;
          }
          @media (min-width: $desktop) {
            height: 40px;
            .button {
              height: 40px;
            }
          }
        }
        .input-container {
          display: flex;
          justify-content: center;
          .button {
            position: absolute;
            right: 10px;
            padding-top: 0;
            font-size: 12px;
            letter-spacing: 1.6px;
            text-transform: capitalize;
            text-align: left;
          }
        }
      }
      .social-and-logos {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        h2 {
          margin-top: 32px;
        }
        @media (min-width: $tablet) {
          h2 {
            margin-top: 10px;
            margin-bottom: 10px;
          }
          justify-content: center;
          align-items: center;
        }
        .social-list {
          display: none;
          @media (min-width: $tablet) {
            display: flex;
            margin-bottom: 24px;
          }
          &:after {
            display: none;
          }
          justify-content: space-between;
          align-items: center;
          li {
            display: inline-flex;
            margin: 0 10px;
            padding: 0;
          }
        }
        .social-list-mobile {
          display: flex;
          margin: 0 auto 20px;
          width: 100%;
          justify-content: space-between;
          align-items: center;
          &:after {
            display: none;
          }
          li {
            line-height: 1;
            padding: 0;
            font-size: 20px;
          }
          a {
            text-decoration: none;
            border-bottom: unset;
          }
          @media (min-width: $tablet) {
            display: none;
          }
        }
        .accept {
          display: none;
          @media (min-width: $tablet) {
            display: block;
          }
        }
        .card-logos {
          display: flex;
          justify-content: space-around;
          align-items: center;
          img {
            margin: 10px;
          }
        }
      }
    }
    .main-logo-large,
    .middle-section {
      border-bottom: 1px solid white;
    }
    .main-logo-large {
      margin: 10px 0 0;
      padding-bottom: 10px;
    }

    #m-left-list {
      padding-left: 0;
      padding-right: 0;
    }

    //disable yellow webkit autofill colour
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active {
      transition: background-color 5000s ease-in-out 0s;
      -webkit-text-fill-color: #ffffff !important;
    }
  }
  .footer {
    position: relative;
    background: #fafafa;
    opacity: 1;
    height: auto;
    bottom: 0;
    width: 100%;
    margin: 0 auto;
    padding-top: 0;
    z-index: 1;
    @media (min-width: $tablet) {
      // position: fixed;
      margin: 0 auto;
      padding: 0;
    }
    .footer-boxes {
      background: #fafafa;
    }
    .left-box {
      margin: 15px 0;
      @media (min-width: $tablet) {
        margin: 0;
      }
    }
  }
  .footer-section {
    background-color: #000d19;
    color: #ffffff;
    font-weight: 400;
    @include font-size(11);
    position: relative;
    // z-index: 9999;
  }

  // start new footer styles
  .footer {
    // .container {
    //   @media (min-width: $desktop) {
    //     width: calc(100% - 102px);
    //     max-width: calc(100% - 102px);
    //   }
    // }
    .main-footer {
      padding: 0 15px;
      @media (min-width: $tablet) {
        padding: 0;
      }
      .mobile-cta {
        padding: 32px 0;
        border-bottom: 1px solid white;
        .mobile-button {
          background: white;
          padding: 5px;
        }
        a {
          display: block;
          font-size: 14px;
          letter-spacing: 1px;
          text-transform: uppercase;
          width: 100%;
          padding: 15px;
          background: white;
          border: 1px solid #000d19;
          border-radius: 2px;
          text-align: center;
          color: #000d19;
          text-decoration: none;
        }
      }
      .top-logo {
        display: grid;
        justify-content: center;
        padding: 32px 0;
        border-bottom: 1px solid white;
      }
      .middle-section {
        @media (min-width: $tablet) {
          padding: 30px 0 30px;
        }
        .social-and-logos {
          justify-content: flex-start;
          .card-logos {
            justify-content: flex-start;
            align-items: flex-start;
          }
          h2 {
            @media (min-width: $tablet) {
              margin: 0;
              margin-bottom: 15px;
            }
          }
        }
        h2 {
          margin-bottom: 15px;
        }
        p {
          margin-bottom: 20px;
        }
        a {
          text-decoration: none;
          border-bottom: 1px solid transparent;
          color: currentColor;
          transition: all 0.6s ease-in-out;
          &:hover {
            border-bottom: 1px solid $lightgrey;
          }
        }
        .telephone {
          a {
            transition: all 0.6s ease-in-out;
            &:hover {
              color: $red;
              border-bottom: 1px solid $red;
            }
          }
        }
        li {
          a {
            &:hover {
              border-bottom: 1px solid transparent;
            }
          }
        }
        .input-container {
          input {
            background-color: #252d34;
            border: none;
            padding: 5px 10px;
            padding-right: 10px;
            padding-right: 65px;
            width: 100%;
            height: 50px;
            color: #ffffff;
            box-shadow: unset;
            outline: none;
            border: unset;
            font-size: 14px;
            padding-right: 70px;
            @media (min-width: $desktop) {
              background-color: #252d34;
              height: 40px;
              border: none;
            }
          }
          input:-webkit-autofill {
            -webkit-box-shadow: 0 0 0px 1000px #00172c inset;
          }
          button {
            cursor: pointer;
            width: 60px;
            height: 50px;
            position: absolute;
            top: 0;
            right: 0;
            text-transform: capitalize;
            padding: 0 15px 0 0px;
            font-size: 12px;
            letter-spacing: 1.6px;
            background-color: transparent;
            border: none;
            color: #ffffff;
            outline: none;
            @media (min-width: $desktop) {
              height: 40px;
            }
            &:hover {
              color: #979797;
            }
          }
        }
      }
      .m-right-list {
        display: flex;
        justify-content: center;
        @media (min-width: $tablet) {
          margin: 0;
        }
        @media (min-width: $desktop) {
          justify-content: flex-end;
          align-items: flex-start;
          text-align: right;
          margin: 32px 0 20px;
        }
        p,
        a {
          font-size: 11px;
          font-weight: 400;
          color: white;
        }
      }
    }
  }
</style>
