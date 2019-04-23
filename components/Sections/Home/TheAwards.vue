<template>
  <section class="section awards step">
    <h1>Awards</h1>
    <div class="container is-flex">
      <img src='/images/best-ui-black.png' />
      <img src='/images/best-innovation-purple.png' />
      <img src='/images/best-ux-black.png' />
    </div>
  </section>
</template>

<script>
export default {
  name: "TheAwards"
}
</script>

<style lang="scss" scoped>
  .awards {
    position: relative;
    padding: 0 $gap;
    margin: $gap 0;
    
    h1.jumbo {
      display: block;
    }

    .container {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;

      img {
        width: 180px;
        height: 180px;
        margin: $gap / 2 auto;
      }

      @include media(md) {
        img {
          width: 120px;
          height: 120px;
          margin: 0 $gap;
        }
      }
    }
  }
</style>
