'use strict'

const Config = {
  appTitle: 'Nunziella Salluce Design',
  appTitleShort: 'Nunziella Salluce',
  appDescription: 'Portfolio Website for Nunziella Salluce',
  appThemeColor: '#ffffff ',
  appBgColor: '#00172c ',
  appIcon: 'assets/app-icon.png',
  wpDomain: 'https://api.nunziellasalluce.com/wp-json',
  client: 'https://api.nunziellasalluce.com',
  url: 'https://nunziellasalluce.netlify.com',
  loadDbName: 'starter_wp',
  api: {
    homePage: '/wp/v2/pages/18',
    contactPage: '/wp/v2/pages/235',
    aboutPage: '/wp/v2/pages/310',
    projects: '/wp/v2/casestudies',
    caseStudy: '/wp/v2/casestudies?slug=',
    postFormContact: '/contact-form-7/v1/contact-forms/78/feedback'
  }
}

module.exports = Config
