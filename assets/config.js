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
  loadDbName: 'starter_wp',
  analyticsPath: 'https://www.google-analytics.com/analytics.js',
  api: {
    homePage: '/wp/v2/pages/18',
    caseStudies: '/wo/v2/casestudies',
    caseStudy: '/wo/v2/casestudies?slug='
  }
}

module.exports = Config
