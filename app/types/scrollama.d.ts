declare module 'scrollama' {
  export interface ScrollamaResponse {
    element: HTMLElement
    index: number
    direction: 'up' | 'down'
  }

  export interface ScrollamaOptions {
    step?: string | HTMLElement | HTMLElement[]
    offset?: number | string
    progress?: boolean
    threshold?: number
    order?: boolean
    once?: boolean
    debug?: boolean
    container?: string | HTMLElement
  }

  export interface ScrollamaInstance {
    setup(options: ScrollamaOptions): this
    onStepEnter(callback: (response: ScrollamaResponse) => void): this
    onStepExit(callback: (response: ScrollamaResponse) => void): this
    onStepProgress(callback: (response: ScrollamaResponse & { progress: number }) => void): this
    resize(): void
    destroy(): void
    enable(): void
    disable(): void
  }

  export default function scrollama(): ScrollamaInstance
}
