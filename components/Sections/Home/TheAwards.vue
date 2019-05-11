<template>
  <section class="section awards step">
    <div class="container is-flex">
      <h1>Awards</h1>
      <h3>I was nominated by public vote for best UI, UX and Innovation as well as receiving special Kudos from CSS Design Awards</h3>

      <img alt='Best UI Design award from CSS Design Awards' src='/images/best-ui-black.png' />
      <img alt='Best Innovation Design award from CSS Design Awards' src='/images/best-innovation-purple.png' />
      <img alt='Best UX Design award from CSS Design Awards' src='/images/best-ux-black.png' />
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
    
    @include media(md) {
      margin: $gap * 2 0 $gap * 3;
    }

    h1 {
      display: block;
      width: 100%;
    }

    h3 {
      margin-bottom: $gap;
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
