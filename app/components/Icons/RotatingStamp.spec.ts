import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RotatingStamp from './RotatingStamp.vue'

describe('RotatingStamp', () => {
  it('renders the current year dynamically', () => {
    const wrapper = mount(RotatingStamp)
    const currentYear = new Date().getFullYear().toString()
    expect(wrapper.text()).toContain(currentYear)
  })

  it('renders the PORTFOLIO text', () => {
    const wrapper = mount(RotatingStamp)
    expect(wrapper.text()).toContain('- PORTFOLIO -')
  })

  it('has correct svg paths', () => {
    const wrapper = mount(RotatingStamp)
    const paths = wrapper.findAll('path')
    expect(paths).toHaveLength(2)
    expect(paths[0].attributes('id')).toBe('circle-path-top')
    expect(paths[1].attributes('id')).toBe('circle-path-bottom')
  })
})
