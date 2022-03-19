import * as React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { map } from '@lib/math'
import { useIsomorphicLayoutEffect } from '@hooks/useIsomorphicLayoutEffect'
import { useSize } from '@hooks/useSize'
import { useWindowEventListener } from '@hooks/useWindowEventListener'
import { useOnInteractionOutside } from '@hooks/useOnInteractionOutside'
import { ThemePicker } from './ThemePicker'

// TODO: limit bar content width on big screens (aligned with content)

const barHeight = 40
const scrollThreshold = 20

const CSSVar = {
  scrollBasedOpacity: '--scroll-based-opacity',
  trayHeight: '--tray-height',
}

function NavBar() {
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const backgroundRef = React.useRef<HTMLDivElement>(null)
  const trayRef = React.useRef<HTMLDivElement>(null)

  const [isTrayOpen, setIsTrayOpen] = React.useState(false)
  const traySize = useSize(trayRef)

  // Initialize scroll based opacity CSS var & keep up-to-date with scroll
  // changes (not set in inline styles to avoid re-renders with each scroll
  // event)

  useIsomorphicLayoutEffect(() => {
    backgroundRef.current?.style.setProperty(
      CSSVar.scrollBasedOpacity,
      `${map(window.scrollY, [0, scrollThreshold], [0, 1])}`
    )
  }, [])

  const setScrollBasedOpacity = React.useCallback(() => {
    backgroundRef.current?.style.setProperty(
      CSSVar.scrollBasedOpacity,
      `${map(window.scrollY, [0, scrollThreshold], [0, 1])}`
    )
  }, [])

  useWindowEventListener('scroll', setScrollBasedOpacity)

  // Handle switching the background's opacity changes from instant (while
  // scrolling) to animated (when opening/closing the tray). Accomplished via
  // toggling the CSS prop transition-property between 'opacity' and 'none'.

  useIsomorphicLayoutEffect(() => {
    const background = backgroundRef.current

    if (!background) return

    // By default, the background's opacity has no transitions. Whenever there
    // is a change due to scrolling, it's applied immediately. But when the tray
    // is opening/closing, there _should_ be a transition, and thus the
    // opacity's transition is enabled.
    if (isTrayOpen) {
      background.style.transitionProperty = 'opacity'
    }

    // When the tray is closing, wait for the transition to end, and restore the
    // opacity to having no animations, and thus apply scroll changes
    // immediately.
    if (!isTrayOpen) {
      const transitionEndHandler = () => {
        background.style.transitionProperty = 'none'
      }

      background.addEventListener('transitionend', transitionEndHandler)

      return () =>
        background.removeEventListener('transitionend', transitionEndHandler)
    }
  }, [isTrayOpen])

  // Close the tray when clicking outside of the bar/tray or scrolling the page

  const closeTray = React.useCallback(() => {
    setIsTrayOpen(false)
  }, [])

  useWindowEventListener('scroll', closeTray)
  useOnInteractionOutside(wrapperRef, closeTray, isTrayOpen)

  return (
    <StickyPlaceholder>
      <Wrapper ref={wrapperRef}>
        <Background ref={backgroundRef} isTrayOpen={isTrayOpen} />
        <Bar>
          <Link href="/">
            <a>Home</a>
          </Link>
          <BarEnd>
            <Nav>
              <Link href="/">
                <a>Home</a>
              </Link>
              <Link href="/writing">
                <a>Writing</a>
              </Link>
            </Nav>
            <ThemePicker />
            <TrayButton onClick={() => setIsTrayOpen((value) => !value)}>
              🟰
            </TrayButton>
          </BarEnd>
        </Bar>
        <TrayWrapper
          isTrayOpen={isTrayOpen}
          style={{ [CSSVar.trayHeight]: `${traySize.height}px` }}
        >
          <Tray ref={trayRef}>
            <Link href="/">
              <a>Home</a>
            </Link>
            <Link href="/writing">
              <a>Writing</a>
            </Link>
          </Tray>
        </TrayWrapper>
      </Wrapper>
    </StickyPlaceholder>
  )
}

const StickyPlaceholder = styled.div`
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: ${barHeight}px;
`

const Wrapper = styled.div`
  position: relative;
`

const Background = styled.div<{ isTrayOpen: boolean }>`
  opacity: ${(p) => (p.isTrayOpen ? 1 : `var(${CSSVar.scrollBasedOpacity})`)};
  position: absolute;
  z-index: -1;
  inset: 0;
  background: hsla(0 0% 0% / 0.1);
  transition-property: none;
  transition-timing-function: cubic-bezier(0.4, 0, 0.25, 1);
  transition-duration: 0.2s;

  @media (min-width: 640px) {
    opacity: var(${CSSVar.scrollBasedOpacity});
  }
`

const Bar = styled.div`
  height: ${barHeight}px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
`

const BarEnd = styled.div`
  display: flex;
  gap: 10px;
`

const Nav = styled.div`
  display: none;

  @media (min-width: 640px) {
    display: flex;
  }
`

const TrayButton = styled.button`
  @media (min-width: 640px) {
    display: none;
  }
`

const TrayWrapper = styled.div<{ isTrayOpen: boolean }>`
  overflow: hidden;
  max-height: ${(p) => (p.isTrayOpen ? `var(${CSSVar.trayHeight})` : 0)};
  transition-property: max-height;
  transition-timing-function: cubic-bezier(0.4, 0, 0.25, 1);
  transition-duration: 0.2s;

  @media (min-width: 640px) {
    max-height: 0;
  }
`

const Tray = styled.div`
  display: flex;
  flex-direction: column;
`

export { NavBar }
