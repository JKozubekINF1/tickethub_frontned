import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

const mocks = vi.hoisted(() => {
  return {
    userState: { token: null, username: null },
    logout: vi.fn()
  }
})

vi.mock('../auth', () => ({
  userState: mocks.userState,
  useAuth: () => ({
    logout: mocks.logout
  })
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  RouterLink: { template: '<a><slot /></a>' },
  RouterView: { template: '<div></div>' }
}))

describe('App.vue', () => {

  it('pokazuje linki Logowania/Rejestracji gdy niezalogowany', () => {
    mocks.userState.token = null 
    mocks.userState.username = null

    const wrapper = mount(App)
    
    const navText = wrapper.find('nav').text()
    expect(navText).toContain('Zaloguj się')
    expect(navText).toContain('Zarejestruj się')
    expect(navText).not.toContain('Wyloguj')
  })

  it('pokazuje Profil/Wyloguj gdy zalogowany', async () => {
    mocks.userState.token = 'fake-token'
    mocks.userState.username = 'TestUser'
    
    const wrapper = mount(App)
    
    const navText = wrapper.find('nav').text()
    expect(navText).toContain('Profil (TestUser)')
    expect(navText).toContain('Wyloguj')
    expect(navText).not.toContain('Zaloguj się')
  })

  it('otwiera modal potwierdzenia przy wylogowaniu', async () => {
    mocks.userState.token = 'fake-token'
    const wrapper = mount(App)

    const logoutLink = wrapper.findAll('a').filter(w => w.text() === 'Wyloguj')[0]
    await logoutLink.trigger('click')

    const modal = wrapper.find('.modal-card')
    expect(modal.exists()).toBe(true)
    expect(modal.text()).toContain('Czy na pewno chcesz się wylogować?')

    await wrapper.find('.btn-primary').trigger('click')

    expect(mocks.logout).toHaveBeenCalled()
    expect(wrapper.find('.modal-card').exists()).toBe(false)
  })
})