import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from '../views/HomeView.vue'

const mocks = vi.hoisted(() => {
  return {
    get: vi.fn()
  }
})

vi.mock('../api', () => ({
  default: {
    get: mocks.get
  }
}))

const MovieScreeningsStub = {
  template: '<div class="movie-screenings-stub" @click="$emit(\'wybierz-miejsca\', 123)"></div>',
  props: ['title', 'screenings']
}

const CinemaHallStub = {
  template: '<div class="cinema-hall-stub"></div>',
  props: ['seansId'],
  emits: ['close', 'success']
}

describe('HomeView.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('pobiera i wyświetla listę miejscowości na starcie', async () => {
    mocks.get.mockResolvedValueOnce({ 
      data: [
        { miejscowosc: 'Wrocław' }, 
        { miejscowosc: 'Legnica' }
      ] 
    })

    const wrapper = mount(HomeView, {
      global: { stubs: { MovieScreenings: true, CinemaHall: true } }
    })

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(wrapper.text()).toContain('Wybierz miejscowość')
    const buttons = wrapper.findAll('.locality-btn')
    expect(buttons.length).toBe(2)
    expect(buttons[0].text()).toBe('Legnica')
    expect(buttons[1].text()).toBe('Wrocław')
  })

  it('po wybraniu miejscowości ładuje seanse', async () => {
    mocks.get.mockResolvedValueOnce({ data: [{ miejscowosc: 'Lubin' }] })
    
    mocks.get.mockResolvedValueOnce({ 
      data: [
        { id: 1, tytul: 'Matrix', data: '2025-10-20T00:00:00', godzina: '18:00' }
      ] 
    })

    const wrapper = mount(HomeView, {
      global: { stubs: { MovieScreenings: MovieScreeningsStub, CinemaHall: CinemaHallStub } }
    })
    await new Promise(resolve => setTimeout(resolve, 0))

    await wrapper.find('.locality-btn').trigger('click')
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(wrapper.text()).toContain('Seanse w: Lubin')
    expect(wrapper.find('.date-btn').exists()).toBe(true)
  })

  it('pokazuje modal sukcesu po udanej rezerwacji', async () => {
    mocks.get.mockResolvedValue({ data: [] })
    
    const wrapper = mount(HomeView, {
      global: { 
        stubs: { MovieScreenings: true, CinemaHall: CinemaHallStub } 
      }
    })

    wrapper.vm.selectedSeansForPopup = 123
    await wrapper.vm.$nextTick()

    const cinemaHall = wrapper.findComponent(CinemaHallStub)
    expect(cinemaHall.exists()).toBe(true)
    
    cinemaHall.vm.$emit('success', 'Bilet kupiony!')
    await wrapper.vm.$nextTick()

    const modal = wrapper.find('.modal-card')
    expect(modal.exists()).toBe(true)
    expect(modal.text()).toContain('Sukces!')
    expect(modal.text()).toContain('Bilet kupiony!')
  })
})