import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import RegisterView from '../views/RegisterView.vue'

const mocks = vi.hoisted(() => {
  return {
    post: vi.fn(() => Promise.resolve({ data: {} })),
    push: vi.fn()
  }
})

vi.mock('../api', () => ({
  default: {
    post: mocks.post
  }
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mocks.push
  })
}))

describe('RegisterView.vue', () => {
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderuje formularz poprawnie (w tym nowe pole potwierdzenia)', () => {
    const wrapper = mount(RegisterView)
    expect(wrapper.text()).toContain('Zarejestruj się')
    expect(wrapper.find('input#email').exists()).toBe(true)
    expect(wrapper.find('input#password').exists()).toBe(true)
    expect(wrapper.find('input#confirmPassword').exists()).toBe(true)
    expect(wrapper.find('.toggle-password').exists()).toBe(true)
  })

  it('przełącza widoczność obu pól hasła', async () => {
    const wrapper = mount(RegisterView)
    const passwordInput = wrapper.find('input#password')
    const confirmInput = wrapper.find('input#confirmPassword')
    const toggleBtn = wrapper.find('.toggle-password')

    expect(passwordInput.attributes('type')).toBe('password')
    expect(confirmInput.attributes('type')).toBe('password')

    await toggleBtn.trigger('click')

    expect(passwordInput.attributes('type')).toBe('text')
    expect(confirmInput.attributes('type')).toBe('text')
  })

  it('pokazuje błąd walidacji, gdy hasła są różne (nie wysyła API)', async () => {
    const wrapper = mount(RegisterView)

    await wrapper.find('input#username').setValue('user1')
    await wrapper.find('input#email').setValue('u@test.com')
    await wrapper.find('input#password').setValue('haslo123')
    await wrapper.find('input#confirmPassword').setValue('innehaslo')
    
    await wrapper.find('form').trigger('submit')
    await new Promise(resolve => setTimeout(resolve, 0))

    const modal = wrapper.find('.modal-card')
    expect(modal.exists()).toBe(true)
    expect(modal.text()).toContain('Błąd')
    expect(modal.text()).toContain('Hasła nie są takie same!')

    expect(mocks.post).not.toHaveBeenCalled()
  })

  it('obsługuje poprawną rejestrację (gdy hasła są takie same)', async () => {
    const wrapper = mount(RegisterView)

    await wrapper.find('input#username').setValue('nowyuser')
    await wrapper.find('input#email').setValue('email@test.com')
    await wrapper.find('input#password').setValue('haslo123')
    await wrapper.find('input#confirmPassword').setValue('haslo123')
    
    await wrapper.find('form').trigger('submit')
    await new Promise(resolve => setTimeout(resolve, 0))

    const modal = wrapper.find('.modal-card')
    expect(modal.exists()).toBe(true)
    expect(modal.text()).toContain('Sukces')
    
    await wrapper.find('.btn-primary').trigger('click')
    expect(mocks.push).toHaveBeenCalledWith('/login')
  })

  it('obsługuje błąd z API (np. email zajęty)', async () => {
    mocks.post.mockRejectedValueOnce({ response: { data: 'Email zajęty' } })

    const wrapper = mount(RegisterView)
    
    await wrapper.find('input#username').setValue('nowyuser')
    await wrapper.find('input#email').setValue('zajety@test.com')
    await wrapper.find('input#password').setValue('haslo123')
    await wrapper.find('input#confirmPassword').setValue('haslo123')

    await wrapper.find('form').trigger('submit')
    await new Promise(resolve => setTimeout(resolve, 0))

    const modal = wrapper.find('.modal-card')
    expect(modal.exists()).toBe(true)
    expect(modal.text()).toContain('Błąd')
    expect(modal.text()).toContain('Email zajęty')
  })
})