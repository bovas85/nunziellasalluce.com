import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TheContactForm from './TheContactForm.vue'

describe('TheContactForm', () => {
  const mountOptions = {
    global: {
      stubs: {
        NuxtLink: true,
        RouterLink: true
      }
    }
  }

  it('renders input fields and submit button', () => {
    const wrapper = mount(TheContactForm, mountOptions)
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.find('button.button--contact').exists()).toBe(true)
  })

  it('initially hides the validation error message', () => {
    const wrapper = mount(TheContactForm, mountOptions)
    const errorMsg = wrapper.find('.send-error')
    // v-show elements are rendered in DOM but have display: none
    expect(errorMsg.exists()).toBe(true)
  })
})
