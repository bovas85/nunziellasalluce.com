<template>
  <div>
    <div class="overlay" @click="$store.commit('closeMenu')" :class="{'is-visible': $store.state.navOpen}"></div>

    <div class="right-nav" :class="{'is-visible': $store.state.navOpen}">
      <div @click="$store.commit('closeMenu')" class="close-button">
        <span class="text">Close</span>
        <div class="close-icon">
          <span class="close-icon--line"></span>
          <span class="close-icon--line inverted"></span>
        </div>
      </div>

      <ul class="menu-items">
        <li>
          <nuxt-link to="/" @click.native="$store.commit('resetMenus')">Home</nuxt-link>
        </li>
        <li>
          <nuxt-link to="/about" @click.native="$store.commit('resetMenus')">About </nuxt-link>
        </li>
        <li>
          <nuxt-link to="/journal" @click.native="$store.commit('resetMenus')">The Journal</nuxt-link>
        </li>
        <li>
          <nuxt-link to="/contact" @click.native="$store.commit('resetMenus')">Contact</nuxt-link>
        </li>
      </ul>

      <hr>

      <div class="menu-footer">
        <div class="images" @click="goTo('/financial-protection')">
          <img class="atol" src="/images/atol-menu.svg" alt="Atol">
          <p>ATOL PROTECTED TRAVEL</p>
        </div>

        <hr>

        <div class="bottom-section is-flex-column">
          <!-- <h4>Social</h4>
          <ul class="social">
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
            </ul> -->

          <h4>Call Us</h4>
          <a class="phone" href="tel:+442070963477">+44 (0)20 7096 3477</a>

          <div class="footer-links">
            <nuxt-link @click.native="$store.commit('resetMenus')" to="/credits">Credits</nuxt-link>
            <nuxt-link @click.native="$store.commit('resetMenus')" to="/privacy-policy">Privacy Policy</nuxt-link>
            <nuxt-link @click.native="$store.commit('resetMenus')" to="/financial-protection">Financial Protection</nuxt-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "AppMenu",
    methods: {
      openSub (continent) {
        this.subMenuActive = true;
        this.activeSubMenu = continent;
      },
      closeSubNav () {
        this.subMenuActive = false;
      }
    }
  };
</script>

<style lang="scss" scoped>
  .overlay {
    position: fixed;
    background: rgba(0, 0, 0, 0.5);
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    opacity: 0;
    z-index: -2;
    transition: all 0.6s ease-in-out;
    &.is-visible {
      opacity: 1;
      z-index: 9000;
    }
  }
  .right-nav {
    background: white;
    position: fixed;
    display: flex;
    flex-direction: column;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    width: 272px;
    height: 100%;
    opacity: 1;
    z-index: 9999;
    padding: 0;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
    transform: translateX(102%);
    transition: transform 0.6s ease-in-out;
    &.is-visible {
      opacity: 1;
      transform: translateX(0);
    }
    .close-button {
      display: flex;
      height: 100px;
      padding-right: 38px;
      justify-content: flex-end;
      align-items: center;
      .text {
        cursor: pointer;
        font-size: 14px;
        letter-spacing: 1.2px;
        text-align: left;
        color: $grey;
      }
      &:hover {
        .close-icon {
          &--line {
            transform: rotate(315deg);
            &.inverted {
              transform: rotate(225deg);
            }
          }
        }
      }
    }
    .close-icon {
      cursor: pointer;
      position: relative;
      padding-left: 25px;
      width: 15px;
      height: 15px;
      &--line {
        position: absolute;
        top: 7px;
        right: 0;
        cursor: pointer;
        display: block;
        margin-bottom: 3px;
        background: $grey;
        border-radius: 1px;
        opacity: 1;
        height: 1px;
        width: 15px;
        transform: rotate(45deg);
        transition: transform 0.3s ease-in;
        &.inverted {
          transform: rotate(-45deg);
          transition: transform 0.3s ease-in 0.1s;
        }
      }
    }
    .menu-items {
      margin-bottom: auto;
      padding-right: 38px;
      li {
        padding: 15px 0;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        position: relative;
        &:after {
          content: "";
          position: absolute;
          bottom: 10px;
          right: 0;
          width: 30px;
          background: $secondary;
          height: 1px;
        }
      }
      a {
        font-size: 16px;
        line-height: 2.69;
        letter-spacing: 0.6px;
        text-align: right;
        color: $secondary;
        text-transform: uppercase;
        transition: all 0.3s ease-in-out;
        &:hover {
          color: $red;
        }
      }
    }
    hr {
      border-bottom: 1px solid #f5f2ec;
      opacity: 0.2;
      margin: 0;
      padding: 0;
      height: 1px;
      width: 100%;
    }

    .menu-footer {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .images {
        display: flex;
        align-items: center;
        cursor: pointer;
        margin-bottom: 20px;
        padding: 0 37px 0 46px;
        transition: all .3s ease-in-out;
        img {
          margin: 0;
          padding: 0;
          margin-right: 17px;
          width: 38px;
          height: 38px;
          opacity: 1;
        }
      }
      p {
        font-size: 10px;
        font-weight: 300;
        font-style: normal;
        font-stretch: normal;
        line-height: 1.4;
        letter-spacing: 0.4px;
        text-align: left;
        color: #818181;
      }
      .bottom-section {
        margin-top: 28px;
        width: 100%;
        justify-content: center;
        text-align: center;
      }
      h4 {
        font-size: 8px;
        letter-spacing: 1px;
        line-height: 1;
        text-align: center;
        padding-bottom: 8px;
        font-weight: 700;
        text-transform: uppercase;
        color: $grey;
      }
      .bottom-section {
        padding: 0 38px;
        padding-bottom: 20px;
        .social {
          padding: 15px 0 30px;
          display: flex;
          justify-content: flex-end;
          &__icon {
            i {
              color: currentColor;
              transition: all 0.3s ease-in-out;
              &:hover {
                color: $red;
              }
              &:before {
                font-size: 14px;
              }
            }
          }
        }
      }
      .footer-links {
        width: 100%;
        line-height: 1;
        padding-bottom: 20px;
        justify-content: center;
        text-align: center;
        a:last-child {
          padding-right: 0;
          &:after {
            display: none;
          }
        }
        a {
          padding-right: 10px;
          line-height: 1;
          position: relative;
          &:after {
            content: "";
            position: relative;
            left: 5px;
            width: 1px;
            height: 90%;
            top: 0;
            border-right: 1px solid currentColor;
          }
        }
      }
      .footer-links a,
      a {
        font-size: 10px;
        line-height: 1;
        letter-spacing: 0.4px;
        text-transform: uppercase;
        text-align: right;
        color: $grey;
        transition: color 0.3s ease-in-out;
        &:hover {
          color: $red;
          &:after {
            color: $grey;
          }
        }
        &.phone {
          padding-bottom: 30px;
          text-align: center;
          font-size: 14px;
          font-weight: normal;
          font-style: normal;
          font-stretch: normal;
          line-height: 1;
          letter-spacing: 0.5px;
          text-align: center;
          color: #818181;
          &:hover {
            color: $red;
          }
        }
      }
    }
  }
</style>
