import styled, { css } from 'styled-components'
import { focusRing } from 'styles/focusRing'

const linkHoverStyles = css`
  color: var(--color-link-hover);
  text-decoration-color: var(--color-link-decoration-hover);
`

const Wrapper = styled.div`
  --line-height: 1.7;

  color: var(--color-fg-prose);
  line-height: var(--line-height);

  & > *:first-child {
    margin-top: 0;
  }

  strong {
    font-weight: 550;
    color: var(--color-fg-accent-muted);
  }

  em {
    font-variation-settings: 'slnt' -10;
    font-synthesis: none;
  }

  p {
    margin-top: 20px;
    margin-bottom: 20px;
  }

  & > p:first-of-type {
    min-height: 3.2em;
  }

  & > p:first-of-type::first-letter {
    font-size: 3.2em;
    font-weight: 500;
    float: left;
    line-height: 0.9;
    margin-right: 8px;
    margin-top: 5px;
    color: var(--color-fg-accent);
  }

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      'Liberation Mono', 'Courier New', monospace;
    font-size: 0.9em;
  }

  /* All code that is not part of a codeblock (i.e. <pre><code>...</code></pre>) */
  *:not(pre) > code {
    background-color: var(--color-bg-subtle);
    border-radius: 6px;
    padding: 2px 4px;
    border: 1px solid var(--color-border-code);
  }

  /* All links that are not heading links */
  *:not(h2, h3, h4) > a {
    position: relative;
    color: var(--color-fg-accent-muted);
    font-weight: 450;
    text-decoration-line: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 1px;
    text-decoration-color: var(--color-link-decoration);

    transition-property: text-decoration-color, color;
    transition-duration: 0.15s;

    @media (hover: hover) {
      &:hover {
        ${linkHoverStyles}
      }
    }

    &:focus-visible {
      ${linkHoverStyles}
    }

    --focus-inset: -2px;
    --focus-radius: 4px;

    ${focusRing}
  }

  ul,
  ol {
    margin-top: 20px;
    margin-bottom: 20px;
  }

  li:not(:last-child) {
    margin-bottom: 14px;
  }

  ul > li {
    position: relative;
    padding-left: 28px;

    &::before {
      content: '';
      position: absolute;
      width: 8px;
      height: 3px;
      border-radius: 2px;
      left: 6px;
      top: calc(var(--line-height) * var(--font-size) / 2);
      transform: translateY(-50%);

      background-color: var(--color-fg-muted);
    }
  }

  ol {
    counter-reset: list;
  }

  ol > li {
    position: relative;
    padding-left: 30px;

    &::before {
      content: counter(list);
      counter-increment: list;
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 9999px;
      left: 2px;
      top: calc(var(--line-height) * var(--font-size) / 2);
      transform: translateY(-50%);
      font-size: 12px;
      font-weight: 600;
      background-color: var(--color-bg-muted);
      color: var(--color-fg-default);
      display: flex;
      align-items: center;
      line-height: 1;
      justify-content: center;
    }
  }
`

export { Wrapper as Wrapper }
