import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'

import { updateSimulationSettings } from '@/mocks/simulation'

function installDialogPolyfill() {
  const prototype = HTMLDialogElement.prototype
  if (typeof prototype.showModal === 'function') return

  prototype.show = function show(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
  prototype.close = function close(this: HTMLDialogElement, returnValue?: string) {
    if (!this.hasAttribute('open')) return
    this.removeAttribute('open')
    if (returnValue !== undefined) this.returnValue = returnValue
    this.dispatchEvent(new Event('close'))
  }
}

installDialogPolyfill()

beforeEach(() => {
  window.localStorage.clear()
  window.history.replaceState(null, '', '/')
  document.documentElement.dir = 'ltr'
  updateSimulationSettings({ failureRate: 0, latency: 'instant', crashedColumn: null })
})

afterEach(() => {
  cleanup()
})
