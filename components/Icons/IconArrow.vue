<template>
  <svg :class="direction" viewBox="0 0 16 40" xmlns="http://www.w3.org/2000/svg" :width="width" :height="height"><title>{{name}}</title><g class="nc-icon-wrapper" :fill="fill"><g id="Symbols" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="UI/icons/arrow" fill-rule="nonzero" :fill="fill"><g id="noun_701466" transform="rotate(-90 20 20)"><g id="Group" transform="rotate(-180 20 7.564)"><path d="M26.85.33c-.362.505-.015 1.009.268 1.34l8.3 4.834c-.426-.142-.867-.268-1.182-.268H0v1.78h34.236c.3 0 .725-.11 1.118-.252l-8.236 4.819c-.394.236-.551.819-.33 1.212.236.41.818.567 1.228.331 4-2.33 7.984-4.677 11.984-6.992-3.984-2.347-8-4.677-11.984-7.008-.457-.236-.82-.047-1.166.205z" id="Shape"/></g></g></g></g></g></svg>
</template>

<script>
    export default {
      name: 'IconArrow',
      props: {
        fill: {
          type: String,
          default: 'white'
        },
        width: {
          type: Number,
          default: 40
        },
        height: {
          type: Number,
          default: 40
        },
        direction: {
          type: String,
          validator: value => {
            // The value must match one of these strings
            return ['left', 'right', 'up', 'down'].indexOf(value) !== -1
          },
          default: 'down'
        },
        name: {
          type: String,
          default: 'arrow'
        }
      }
    }
</script>

<style scoped lang="scss">
    .left,
    .right,
    .bottom,
    .up {
      transform-origin: center;
    }
    .left {
      transform: rotate(90deg);
    }
    .right {
      transform: rotate(-90deg);
    }
    .down {
      transform: rotate(0deg);
    }
    .up {
      transform: rotate(180deg);
    }
</style>
