import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RegisterView from '../views/RegisterView.vue'

vi.mock('../api', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ data: {} }))
  }
}))

const pushMock = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock
  })
}))

describe('RegisterView.vue', () => {
  
  it('renderuje formularz poprawnie', () => {
    const wrapper = mount(RegisterView)
    expect(wrapper.text()).toContain('Zarejestruj się')
    expect(wrapper.find('input#email').exists()).toBe(true)
    expect(wrapper.find('.toggle-password').exists()).toBe(true)
  })

  it('przełącza widoczność hasła', async () => {
    const wrapper = mount(RegisterView)
    const passwordInput = wrapper.find('input#password')
    const toggleBtn = wrapper.find('.toggle-password')

    expect(passwordInput.attributes('type')).toBe('password')
    await toggleBtn.trigger('click')
    expect(passwordInput.attributes('type')).toBe('text')
  })

  it('obsługuje poprawną rejestrację (pokazuje modal sukcesu)', async () => {
    const wrapper = mount(RegisterView)
    

    await wrapper.find('input#username').setValue('nowyuser')
    await wrapper.find('input#email').setValue('email@test.com')
    await wrapper.find('input#password').setValue('haslo123')
    await wrapper.find('form').trigger('submit')
    await new Promise(resolve => setTimeout(resolve, 0))

    const modal = wrapper.find('.modal-card')
    expect(modal.exists()).toBe(true)
    expect(modal.text()).toContain('Sukces')
    await wrapper.find('.btn-primary').trigger('click')
    expect(pushMock).toHaveBeenCalledWith('/login')
  })

  it('obsługuje błąd rejestracji', async () => {
    const apiClient = await import('../api')
    apiClient.default.post.mockRejectedValueOnce({ response: { data: 'Email zajęty' } })

    const wrapper = mount(RegisterView)
    await wrapper.find('form').trigger('submit')

    await new Promise(resolve => setTimeout(resolve, 0))

    const modal = wrapper.find('.modal-card')
    expect(modal.exists()).toBe(true)
    expect(modal.text()).toContain('Błąd')
    expect(modal.text()).toContain('Email zajęty')
  })
})