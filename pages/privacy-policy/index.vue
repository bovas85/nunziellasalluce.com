<template>
  <div class="privacy-policy">
    <div class="container">
      <h1>Privacy Policy</h1>
      <div class="policy">
        <h2>Who I am</h2>
        <p>My website address is: <nuxt-link to="/">https://nunziellasalluce.com</nuxt-link>.</p>
        <h2>What personal data we collect and why we collect it</h2>
        <h2>Cookies</h2>
        <p>If you leave a comment on my site you may opt-in to save your name, email address and website in local browser storage. It's for your convenience so that you do not have to fill in your details again when you fill the contact form.

        HotJar also tracks your visit using cookies.
        I use hotjar to see how my users interact while visiting my website.
        You can opt-out of this using the "Do not track" option in your browser.

        Data in Hotjar is removed in compliance with GDPR rules.

        For more information, please visit Hotjar's Privacy Policy here 
        <a href="https://www.hotjar.com/legal/policies/privacy" target="_blank">https://www.hotjar.com/legal/policies/privacy</a>
        </p>

        <h2>Where do I send your data</h2>
        <p>Nowhere.</p>
      </div>
    </div>
  </div>
</template>

<script>
  export default {}
</script>

<style lang="scss" scoped>
  .privacy-policy {
    margin: $gap * 6 $gap $gap * 2;
    min-height: 100vh;

    a {
      position: relative;

      &:hover {
        text-decoration: underline;
      }
    }

    h2 {
      margin: $gap 0;
      position: relative;
      display: inline-block;
    }
  }
</style>
