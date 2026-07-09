import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TheLogo from './TheLogo.vue'
import TheLogoStatic from './TheLogoStatic.vue'

describe('Logo Components', () => {
  it('renders TheLogo component', () => {
    const wrapper = mount(TheLogo, {
      props: {
        animating: true
      }
    })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('svg').classes()).toContain('animating')
  })

  it('renders TheLogoStatic component', () => {
    const wrapper = mount(TheLogoStatic, {
      props: {
        static: true
      }
    })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('svg').classes()).toContain('static')
  })
})
