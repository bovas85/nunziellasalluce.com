<template>
  <div class="privacy-policy">
    <div class="container">
      <h1>Privacy Policy</h1>
      <div class="policy">
        <h2>Who I am</h2>
        My website address is: <nuxt-link to="/">https://nunziellasalluce.com</nuxt-link>.
        <h2>What personal data we collect and why we collect it</h2>
        <h2>Cookies</h2>
        If you leave a comment on my site you may opt-in to save your name, email address and website in cookies. These are for your convenience so that you do not have to fill in your details again when you leave another comment. These cookies will last for one year.

        If you have an account and you log in to this site, we will set a temporary cookie to determine if your browser accepts cookies. This cookie contains no personal data and is discarded when you close your browser.

        When you log in, we will also set up several cookies to save your login information and your screen display choices. Login cookies last for two days, and screen options cookies last for a year. If you select "Remember Me", your login will persist for two weeks. If you log out of your account, the login cookies will be removed.

        If you edit or publish an article, an additional cookie will be saved in your browser. This cookie includes no personal data and simply indicates the post ID of the article you just edited. It expires after 1 day.
        <h2>Embedded content from other websites</h2>
        Articles on this site may include embedded content (e.g. videos, images, articles, etc.). Embedded content from other websites behaves in the exact same way as if the visitor has visited the other website.

        These websites may collect data about you, use cookies, embed additional third-party tracking, and monitor your interaction with that embedded content, including tracking your interaction with the embedded content if you have an account and are logged in to that website.
        
        <h2>How long we retain your data</h2>
        If you leave a comment, the comment and its metadata are retained indefinitely. This is so we can recognise and approve any follow-up comments automatically instead of holding them in a moderation queue.

        For users that register on my website (if any), we also store the personal information they provide in their user profile. All users can see, edit, or delete their personal information at any time (except they cannot change their username). Website administrators can also see and edit that information.
        <h2>What rights you have over your data</h2>
        If you have an account on this site or have left comments, you can request to receive an exported file of the personal data we hold about you, including any data you have provided to us. You can also request that we erase any personal data we hold about you. This does not include any data we are obliged to keep for administrative, legal, or security purposes.
        <h2>Where we send your data</h2>
        Visitor comments may be checked through an automated spam detection service.
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

    h2 {
      margin: $gap 0;
    }
  }
</style>
