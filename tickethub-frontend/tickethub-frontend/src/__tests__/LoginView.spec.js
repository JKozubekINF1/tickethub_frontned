import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginView from '../views/LoginView.vue'

vi.mock('../api', () => ({
  default: {
    post: vi.fn(() => Promise.resolve({ 
      data: { token: 'fake-token', username: 'testuser' } 
    }))
  }
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

vi.mock('../auth', () => ({
  useAuth: () => ({
    login: vi.fn()
  })
}))

describe('LoginView.vue', () => {
  
  it('renderuje formularz poprawnie', () => {
    const wrapper = mount(LoginView)
    expect(wrapper.text()).toContain('Zaloguj się')
    expect(wrapper.find('input#username').exists()).toBe(true)
    expect(wrapper.find('input#password').exists()).toBe(true)
  })

  it('przełącza widoczność hasła (oko)', async () => {
    const wrapper = mount(LoginView)
    const passwordInput = wrapper.find('input#password')
    const toggleButton = wrapper.find('.toggle-password')

    expect(passwordInput.attributes('type')).toBe('password')

    await toggleButton.trigger('click')

    expect(passwordInput.attributes('type')).toBe('text')

    await toggleButton.trigger('click')

    expect(passwordInput.attributes('type')).toBe('password')
  })

  it('wysyła dane logowania po kliknięciu Zaloguj', async () => {
    const wrapper = mount(LoginView)
    
    await wrapper.find('input#username').setValue('janusz')
    await wrapper.find('input#password').setValue('tajnehaslo')
    
    await wrapper.find('form').trigger('submit')

    const apiClient = await import('../api')
    expect(apiClient.default.post).toHaveBeenCalledWith('/Auth/login', {
      username: 'janusz',
      password: 'tajnehaslo'
    })
  })

  it('pokazuje modal błędu przy złych danych', async () => {
    const apiClient = await import('../api')
    apiClient.default.post.mockRejectedValueOnce(new Error('Błąd'))

    const wrapper = mount(LoginView)
    
    await wrapper.find('input#username').setValue('janusz')
    await wrapper.find('input#password').setValue('złe')
    await wrapper.find('form').trigger('submit')

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(wrapper.find('.modal-card').exists()).toBe(true)
    expect(wrapper.text()).toContain('Błąd logowania')
  })
})