import Vue from 'vue'
import { storiesOf } from '@storybook/vue'
import CaseStudy from './CaseStudy'
storiesOf('CaseStudy', module)
  .add('As a component', () => ({
    components: { CaseStudy },
    template: '<CaseStudy />'
  }))
  .add('I don\'t work', () => '<CaseStudy />')