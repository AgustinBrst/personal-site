import * as React from 'react'
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect'

type Size = {
  width: number
  height: number
}

function useSize<T extends HTMLElement>(): [React.RefObject<T>, Size] {
  const ref = React.useRef<T>(null)
  const [size, setSize] = React.useState<Size>({ width: 0, height: 0 })

  useIsomorphicLayoutEffect(() => {
    if (!ref.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setSize({ width, height })
    })

    resizeObserver.observe(ref.current)

    return () => resizeObserver.disconnect()
  }, [])

  return [ref, size]
}

export { useSize }
