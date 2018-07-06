<template>
  <div>
    <div 
      class="overlay" 
      @click="$store.commit('closeMenu')" 
      :class="{'is-visible': $store.state.navOpen}"/>
    <div 
      class="right-nav" 
      :class="{'is-visible': $store.state.navOpen}">
      <div 
        @click="$store.commit('closeMenu');" 
        class="close-button">
        <div class="close-icon">
          <span class="close-icon--line"/>
          <span class="close-icon--line inverted"/>
        </div>
        <span class="text">Close</span>
      </div>

      <ul class="menu">
        <nuxt-link
          v-for="(menu, index) in menuItems"
          :key="index"
          :to="`/${menu}`"
        >
          {{ menu === '' ? 'Home' : menu }}
        </nuxt-link>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'AppMenuMobile',
    props: {
      menuItems: {
        type: Array,
        default: () => []
      }
    }
  }
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
    overflow: auto;
    position: fixed;
    top: 0;
    left: 50px;
    right: 0;
    bottom: 0;
    width: 100%;
    width: calc(100% - 50px);
    height: 100%;
    opacity: 1;
    z-index: 9999;
    padding: 0 15px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
    transform: translateX(102%);
    transition: transform 0.6s ease-in-out;
    &.is-visible {
      opacity: 1;
      transform: translateX(0);
    }
    .close-button {
      display: flex;
      height: 60px;
      justify-content: flex-end;
      align-items: center;
      .text {
        cursor: pointer;
        font-size: 14px;
        letter-spacing: 1.2px;
        text-align: left;
        color: $grey;
      }
    }
    .close-icon {
      cursor: pointer;
      position: relative;
      padding-right: 20px;
      width: 15px;
      height: 15px;
      &--line {
        position: absolute;
        top: 7px;
        left: 0;
        cursor: pointer;
        display: block;
        margin-bottom: 3px;
        background: $grey;
        border-radius: 1px;
        opacity: 1;
        height: 1px;
        width: 15px;
        transform: rotate(45deg);
        &.inverted {
          transform: rotate(-45deg);
        }
      }
    }
    .menu-items {
      margin-bottom: 100px;
      li {
        padding: 15px 0;
        display: flex;
        cursor: pointer;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #ededed;
        transition: all 0.3s ease-in-out;
        &:hover,
        &:hover i,
        &:hover a {
          color: $red;
        }
      }
      a {
        font-size: 14px;
        line-height: 1;
        letter-spacing: 0.5px;
        text-align: left;
        color: $secondary;
        text-transform: uppercase;
        transition: all 0.3s ease-in-out;
      }
      i {
        line-height: 1;
        width: 7px;
        font-size: 16px;
        height: 19px;
        transition: all 0.3s ease-in-out;
      }
    }
  }
  .menu {
    display: flex;
    height: 200px;
    justify-content: center;
    align-items: flex-end;
    flex-direction: column;
    a {
      margin: 15px 0;
      cursor: pointer;
      font-size: 18px;
      text-transform: uppercase;
      font-weight: 400;
      &.nuxt-link-active {
        font-weight: bold;
      }
    }
  }
</style>