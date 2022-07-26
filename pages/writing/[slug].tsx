import { AsideTableOfContents } from '@components/AsideTableOfContents'
import { FloatingTableOfContents } from '@components/FloatingTableOfContents'
import { CalendarIcon } from '@components/icons/CalendarIcon'
import { ClockIcon } from '@components/icons/ClockIcon'
import { HashIcon } from '@components/icons/HashIcon'
import { LikeIcon as BaseLikeIcon } from '@components/icons/LikeIcon'
import { Link } from '@components/Link'
import { components } from '@components/mdx'
import { Parallax } from '@components/Parallax'
import { UpNext } from '@components/UpNext'
import { useIsomorphicLayoutEffect } from '@hooks/useIsomorphicLayoutEffect'
import { useLikeCount } from '@hooks/useLikeCount'
import { useOnInteractionOutside } from '@hooks/useOnInteractionOutside'
import { useViewCount } from '@hooks/useViewCount'
import { useWindowEventListener } from '@hooks/useWindowEventListener'
import { getArticles } from '@lib/articles'
import { compareDatesDesc, formatDate } from '@lib/dates'
import { Root } from '@lib/mdast-util-toc'
import {
  ChevronUpIcon,
  GitHubLogoIcon,
  ListBulletIcon
} from '@radix-ui/react-icons'
import clsx from 'clsx'
import { useNavBar } from 'contexts/nav-bar'
import { TableOfContentsProvider } from 'contexts/table-of-contents'
import { getMDXComponent } from 'mdx-bundler/client'
import { GetStaticPaths, GetStaticProps } from 'next'
import NextImage from 'next/image'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import * as React from 'react'
import styled, { css, keyframes } from 'styled-components'

const barHeight = 70
const barBottomMargin = 48
const asideWidth = 240

type ArticlePreview = {
  title: string
  slug: string
  imageSrc: string | null
}

type Props = {
  slug: string
  title: string
  tags: Array<string>
  imageSrc: string | null
  tableOfContents: Root
  readingTime: string
  publishedOn: number
  contentCode: string
  newerArticle: ArticlePreview | null
  olderArticle: ArticlePreview | null
}

function ArticlePage(props: Props) {
  const router = useRouter()

  const Content = React.useMemo(
    () => getMDXComponent(props.contentCode),
    [props.contentCode]
  )

  const likeCount = useLikeCount(props.slug)
  const viewCount = useViewCount(props.slug)

  // Table of Contents

  const tableOfContentsRef = React.useRef<HTMLDivElement>(null)
  const tableOfContentsButtonRef = React.useRef<HTMLButtonElement>(null)

  const [isTableOfContentsOpen, setIsTableOfContentsOpen] =
    React.useState(false)

  const closeTableOfContents = React.useCallback(() => {
    setIsTableOfContentsOpen(false)
  }, [])

  const toggleTableOfContents = React.useCallback(() => {
    setIsTableOfContentsOpen((value) => !value)
  }, [])

  useOnInteractionOutside(
    [tableOfContentsRef, tableOfContentsButtonRef],
    closeTableOfContents,
    isTableOfContentsOpen
  )

  // Back to Top

  const [showBackToTop, setShowBackToTop] = React.useState(false)

  const updateShowBackToTop = React.useCallback(() => {
    // Show back-to-top button once the page has been scrolled at least the
    // height of the viewport
    setShowBackToTop(window.scrollY > window.innerHeight)
  }, [])

  useWindowEventListener('scroll', updateShowBackToTop)
  useWindowEventListener('resize', updateShowBackToTop)

  // Using a marker (just a hidden element), set the scrollY value that should
  // be considered the end of the article. Whenever there is a document size
  // change, that value is updated using the new position of the marker.

  const navBar = useNavBar()
  const contentEndMarkerRef = React.useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    const contentEndMarker = contentEndMarkerRef.current

    if (!contentEndMarker) return

    const resizeObserver = new ResizeObserver(() => {
      const markerTop = contentEndMarker.getBoundingClientRect().top
      const markerTopRelativeToDocument = markerTop + window.scrollY

      navBar.setProgressCompleteThreshold(markerTopRelativeToDocument)
    })

    resizeObserver.observe(document.documentElement)

    return () => resizeObserver.disconnect()
  }, [navBar])

  return (
    <TableOfContentsProvider tableOfContents={props.tableOfContents}>
      <Wrapper>
        <HeaderImageWrapper>
          <StyledParallax
            multiplier={-0.2}
            getOffset={getOffset}
            // Rerender the component on path changes to avoid keeping its state
            // (i.e. its parallax effect) when going back and forth between
            // articles. Comment this line and, after scrolling to the bottom
            // and select the previous/next article, pay close attention to the
            // header image, it keeps the parallax accumulated from
            // scrolling on the previous article.
            key={router.asPath}
          >
            {props.imageSrc && (
              <NextImage
                src={props.imageSrc}
                layout="fill"
                objectFit="cover"
                priority
              />
            )}
          </StyledParallax>
          <HeaderImageOverlay />
        </HeaderImageWrapper>
        {props.tableOfContents.children.length > 0 && (
          <Aside>
            <AsideTableOfContents />
          </Aside>
        )}
        <Header>
          <Info>
            <InfoItem>
              <CalendarIcon />
              <span>{formatDate(props.publishedOn)}</span>
            </InfoItem>
            <InfoItem>
              <ClockIcon />
              <span>{props.readingTime}</span>
            </InfoItem>
          </Info>
          <Title>{props.title}</Title>
          {props.tags.length > 0 && (
            <Tags>
              {props.tags.map((tag) => (
                <NextLink key={tag} href={`/writing?tags=${tag}`} passHref>
                  <Tag>
                    <TagIcon />
                    {tag}
                  </Tag>
                </NextLink>
              ))}
            </Tags>
          )}
        </Header>
        <Main>
          <Content components={components} />
          <ContentEndMarker ref={contentEndMarkerRef} />
          <ViewCount>{viewCount.value} views</ViewCount>
          <Thanks>
            <ThanksTitle>Thanks for reading!</ThanksTitle>
            <ThanksDescription>
              I would love to hear your thoughts, all feedback is very much
              welcome. You can find me on{' '}
              <a href="https://twitter.com/bursetAgustin">Twitter</a> or via{' '}
              <a href="mailto:tinos.corner@icloud.com">email</a>.
            </ThanksDescription>
            <LikeButton
              className={clsx({ liked: likeCount.hasUserLike })}
              onClick={likeCount.toggleUserLike}
            >
              <LikeIconWrapper>
                <LikeIcon />
              </LikeIconWrapper>
              {likeCount.value}
            </LikeButton>
          </Thanks>
          <EditOnGitHub>
            Found a typo?
            <EditOnGitHubLink
              href={getArticleEditOnGitHubURL(props.slug)}
              target="_blank"
            >
              <EditOnGitHubIcon />
              Edit on GitHub
            </EditOnGitHubLink>
          </EditOnGitHub>
        </Main>
      </Wrapper>
      <UpNext
        newerArticle={props.newerArticle}
        olderArticle={props.olderArticle}
      />
      <FloatingStuff>
        {/* TODO: add tooltips "Open Table Of Contents", "Back to Top", etc */}
        <ButtonGroup className={clsx({ expanded: showBackToTop })}>
          <ButtonBackground>
            <BackToTopButton onClick={backToTop}>
              <BackToTopIcon width={26} height={26} />
            </BackToTopButton>
          </ButtonBackground>
          <ButtonGroupDivider />
          <ButtonBackground>
            <TableOfContentsButton
              ref={tableOfContentsButtonRef}
              onClick={toggleTableOfContents}
            >
              <TableOfContentsIcon width={26} height={26} />
            </TableOfContentsButton>
          </ButtonBackground>
        </ButtonGroup>
        <FloatingTableOfContents
          ref={tableOfContentsRef}
          onSelect={closeTableOfContents}
          isOpen={isTableOfContentsOpen}
        />
      </FloatingStuff>
    </TableOfContentsProvider>
  )
}

const Wrapper = styled.div`
  --gap: 40px;

  isolation: isolate;
  margin-bottom: 48px;
  margin-top: -${barHeight + barBottomMargin}px;
  display: grid;
  grid-template-columns: 1fr min(100vw, calc(768px + 2 * 16px)) 1fr;
  grid-template-areas:
    '... header ...'
    '... main aside';
  grid-row-gap: var(--gap);
`

const HeaderImageWrapper = styled.div`
  position: relative;
  grid-row: 1;
  grid-column: 1 / -1;
  margin-bottom: -20px;
  overflow: hidden;
`

const StyledParallax = styled(Parallax)`
  position: absolute;
  inset: 0;
  z-index: -1;
`

const HeaderImageOverlay = styled.div`
  position: absolute;
  inset: 0;
  top: ${barHeight}px;
  background: var(--gradient-header-image);
`

const Aside = styled.aside`
  grid-area: aside;
  align-self: start;
  position: sticky;
  top: calc(${barHeight}px + var(--gap));

  padding-left: 20px;
  padding-right: 24px;
  display: none;

  /* TODO: clean-up magic numbers */
  @media (min-width: calc(768px + 2 * 16px + ${asideWidth}px * 2)) {
    display: revert;
  }
`

const Main = styled.main`
  grid-area: main;
  padding-right: 24px;
  padding-left: 24px;

  & > *:first-child {
    margin-top: 0;
  }

  @media (min-width: 640px) {
    padding-left: 40px;
    padding-right: 40px;
  }
`

const Header = styled.header`
  position: relative;
  grid-area: header;
  align-self: end;
  padding-right: 24px;
  padding-left: 24px;
  padding-bottom: 48px;
  margin-top: 45vh;

  &::before {
    position: absolute;
    bottom: 0;
    left: 16px;
    right: 16px;
    display: block;
    content: '';
    height: 1px;
    background-color: var(--color-border);
  }

  @media (min-width: 640px) {
    padding-left: 40px;
    padding-right: 40px;
    margin-top: 40vh;

    &::before {
      left: 32px;
      right: 32px;
    }
  }
`

const Info = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 14px;
  font-weight: 550;
  color: var(--color-fg-contrast);
`

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const Title = styled.h1`
  color: var(--color-fg-accent);
  font-size: 2.2rem;
  font-weight: 600;
  margin-top: 18px;
  margin-bottom: 0;
`

const Tags = styled.div`
  --gap: 8px;
  margin-top: 20px;
  margin-left: -24px;
  margin-right: -24px;
  padding-left: 24px;
  max-width: 100vw;
  display: flex;
  overflow-y: hidden;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-left: 24px;
  -ms-overflow-style: none;
  scrollbar-width: none;
  overscroll-behavior: contain;

  &::after {
    /* Weird trick to get padding at the end/right of a scroll container (just
    like on the start/left, which works just fine without doing weird tricks)
    */
    content: '';
    padding-left: 40px;
  }

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 640px) {
    margin-left: 0;
    margin-right: 0;
    padding: 0;
    max-width: 100%;
    flex-wrap: wrap;
    row-gap: var(--gap);

    &::after {
      display: none;
    }
  }
`

const Tag = styled.a`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  color: var(--color-fg-tag);
  background-color: var(--color-bg-tag);

  backdrop-filter: saturate(180%) blur(10px);
  border-radius: 8px;
  padding: 8px 10px 8px 8px;
  scroll-snap-align: start;

  transition-property: transform, background-color;
  transition-duration: 0.1s;
  transition-timing-function: ease-in-out;

  &:not(:last-child) {
    margin-right: var(--gap);
  }

  &:hover {
    background-color: var(--color-bg-tag-hover);
  }

  &:active {
    transform: scale(0.95);
  }
`

const TagIcon = styled(HashIcon)`
  width: 14px;
  height: 14px;
  color: var(--color-fg-subtle);
`

const FloatingStuff = styled.div`
  --inset: 16px;

  z-index: 1;
  position: fixed;
  pointer-events: none;
  right: var(--inset);
  bottom: var(--inset);
  display: flex;
  flex-direction: column-reverse;
  align-items: stretch;
  gap: 12px;
  width: calc(100vw - 2 * var(--inset));
  max-width: 380px;
  max-height: calc(100vh - var(--inset) * 2 - ${barHeight}px);

  @media (min-width: 640px) {
    --inset: 24px;
  }

  @media (min-width: calc(768px + 2 * 16px + ${asideWidth}px * 2)) {
    display: none;
  }
`

const ButtonGroup = styled.div`
  --button-width: 46px;
  --divider-width: 1px;

  pointer-events: auto;
  color: var(--color-fg-accent);
  z-index: 1;
  overflow: hidden;
  flex-shrink: 0;
  height: 44px;
  align-self: flex-end;
  display: flex;
  justify-content: right;
  border-radius: 12px;
  background: var(--color-bg-translucent);
  backdrop-filter: saturate(180%) blur(20px);
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.04), 0px 10px 60px rgba(0, 0, 0, 0.1),
    0 0 0 1px var(--color-shadow-border),
    inset 0 0 0 1px var(--color-shadow-border-contrast);
  max-width: var(--button-width);

  transition-property: max-width;
  transition-duration: 0.2s;
  transition-timing-function: ease-in-out;

  &.expanded {
    max-width: calc(var(--button-width) * 2 + var(--divider-width));
  }
`

const ButtonGroupDivider = styled.div`
  flex: 0 0 var(--divider-width);
  height: 100%;
  background-color: var(--color-border);
  opacity: 0;

  transition-property: opacity;
  transition-duration: 0.2s;
  transition-timing-function: ease-in-out;

  ${ButtonGroup}.expanded & {
    opacity: 1;
  }
`

const ButtonBackground = styled.div`
  line-height: 0;
  flex-shrink: 0;
  width: var(--button-width);
  height: 100%;

  transition-property: background-color;
  transition-duration: 0.1s;
  transition-timing-function: ease-in-out;

  &:hover {
    background-color: var(--color-bg-subtle);
  }
`

const Button = styled.button`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`

const TableOfContentsButton = styled(Button)``

const BackToTopButton = styled(Button)`
  opacity: 0;
  transform: scale(0.5);

  transition-property: opacity, transform;
  transition-duration: 0.15s;
  transition-delay: 0s;

  ${ButtonGroup}.expanded & {
    opacity: 1;
    transform: none;
    transition-delay: 0.1s;
  }
`

const sharedIconsStyles = css`
  transition-property: transform;
  transition-duration: 0.1s;
  transition-timing-function: ease-in-out;

  ${Button}:active & {
    transform: scale(0.92);
  }
`

const TableOfContentsIcon = styled(ListBulletIcon)`
  ${sharedIconsStyles}
`

const BackToTopIcon = styled(ChevronUpIcon)`
  ${sharedIconsStyles}
`

const ViewCount = styled.div`
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
  margin-top: 32px;
  color: var(--color-fg-subtle);
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
`

const Thanks = styled.div`
  padding: 24px;
  padding-top: 28px;
  border-radius: 16px;
  background-color: var(--color-bg-subtle);
  margin-top: 32px;

  @media (min-width: 640px) {
    max-width: 360px;
    margin-left: auto;
    margin-right: auto;
  }
`

const ThanksTitle = styled.h2`
  text-align: center;
  font-size: 20px;
  font-weight: 550;
  color: var(--color-fg-accent-muted);
`

const ThanksDescription = styled.p`
  margin-top: 16px;
  text-align: center;
  font-size: 16px;
  font-weight: 450;
  line-height: 1.5;
  color: var(--color-fg-default);

  & a {
    color: var(--color-link);
    font-weight: 500;
    text-decoration-line: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 1px;
    text-decoration-color: var(--color-link-decoration);

    transition-property: text-decoration-color, color;
    transition-duration: 0.15s;
  }

  & a:hover {
    color: var(--color-link-hover);
    text-decoration-color: var(--color-link-decoration-hover);
  }
  @media (min-width: 640px) {
    font-weight: 400;

    & a {
      font-weight: 450;
    }
  }
`

const LikeButton = styled.button`
  --accent-color: hsl(348 83% 47%);
  --accent-color-muted: hsl(348 90% 38%);

  user-select: none;
  margin-top: 16px;
  width: 100%;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  line-height: 1;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;

  transition-property: transform, color;
  transition-duration: 0.15s;

  &:active {
    transform: scale(0.9);
  }

  &.liked {
    color: var(--color-fg-accent-muted);
  }
`

const bounceUp = keyframes`
  0% {
    transform: none;
    animation-timing-function: ease-out;
  }
  50% {
    transform: translateY(-4px);
    animation-timing-function: ease-in;
  }
  100% {
    transform: none;
  }
`

const LikeIconWrapper = styled.div`
  position: relative;
  will-change: transform;

  ::before {
    content: '';
    z-index: -1;
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background-color: var(--accent-color);
    opacity: 0.1;
    transform: scale(0);

    transition-property: transform, opacity;
    transition-duration: 0.6s;
  }

  ${LikeButton}.liked & {
    animation: ${bounceUp} 0.3s;

    ::before {
      opacity: 0;
      transform: scale(3);
    }
  }

  ${LikeButton}:active & {
    ::before {
      transform: scale(1.2);

      transition-duration: 0.3s;
    }
  }

  ${LikeButton}.liked:active & {
    ::before {
      opacity: 0;
      transform: scale(0);
      transition: none;
    }
  }
`

const LikeIcon = styled(BaseLikeIcon)`
  display: block;
  fill: var(--color-fg-subtle);

  transition-property: fill;
  transition-duration: 0.15s;

  ${LikeButton}.liked & {
    fill: var(--accent-color);
    transition-duration: 0.3s;
  }

  ${LikeButton}:active & {
    fill: var(--accent-color-muted);
  }
`

const EditOnGitHub = styled.div`
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  color: var(--color-fg-default);
  font-size: 14px;
  font-weight: 500;
`

const EditOnGitHubLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
`

const EditOnGitHubIcon = styled(GitHubLogoIcon)`
  width: 18px;
  height: 18px;
`

const ContentEndMarker = styled.div`
  visibility: hidden;
`

/* ---------------------------------- Misc --------------------------------- */

function getOffset(element: HTMLElement): number {
  const { top } = element.getBoundingClientRect()

  const elementReferenceY = top
  const viewportReferenceY = 0

  return elementReferenceY - viewportReferenceY
}

function backToTop() {
  window.scroll({ behavior: 'smooth', top: 0 })
}

function getEditOnGitHubURL(
  username: string,
  repo: string,
  file: string,
  branch = 'main'
): string {
  return `https://github.com/${username}/${repo}/edit/${branch}/${file}`
}

function getArticleEditOnGitHubURL(slug: string) {
  return getEditOnGitHubURL(
    'tino-brst',
    'personal-site',
    `articles/${slug}.mdx`
  )
}

/* ---------------------------------- Next.js ------------------------------- */

type PathParams = {
  slug: string
}

const getStaticPaths: GetStaticPaths<PathParams> = async () => {
  const paths = (await getArticles()).map(({ slug }) => ({ params: { slug } }))

  return {
    paths,
    fallback: false,
  }
}

const getStaticProps: GetStaticProps<Props, PathParams> = async (context) => {
  const articles = (await getArticles()).sort((a, b) =>
    compareDatesDesc(a.publishedOn, b.publishedOn)
  )

  const currentArticleIndex = articles.findIndex(
    (article) => article.slug === context.params!.slug
  )

  const currentArticle = articles[currentArticleIndex]
  const newerArticle = articles[currentArticleIndex - 1] ?? null
  const olderArticle = articles[currentArticleIndex + 1] ?? null

  return {
    props: {
      ...currentArticle,
      newerArticle,
      olderArticle,
    },
  }
}

export default ArticlePage
export { getStaticPaths, getStaticProps }
