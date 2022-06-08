import { Code } from '@components/markdown/Code'
import { CodeBlock } from '@components/markdown/CodeBlock'
import { Heading2, Heading3, Heading4 } from '@components/markdown/Heading'
import { Image } from '@components/markdown/Image'
import { Link } from '@components/markdown/Link'
import { Paragraph } from '@components/markdown/Paragraph'
import { Strong } from '@components/markdown/Strong'
import { Parallax } from '@components/Parallax'
import {
  AsideTableOfContents,
  TableOfContents,
} from '@components/TableOfContents'
import { useLikeCount } from '@hooks/useLikeCount'
import { useOnInteractionOutside } from '@hooks/useOnInteractionOutside'
import { useViewCount } from '@hooks/useViewCount'
import { useWindowEventListener } from '@hooks/useWindowEventListener'
import { getArticles } from '@lib/articles'
import { compareDatesDesc, formatDate } from '@lib/dates'
import { Root } from '@lib/mdast-util-toc'
import {
  ArrowLeftIcon,
  CalendarIcon,
  ChevronUpIcon,
  ClockIcon,
  GitHubLogoIcon,
  HeartFilledIcon,
  ListBulletIcon,
} from '@radix-ui/react-icons'
import clsx from 'clsx'
import { TableOfContentsProvider } from 'contexts/table-of-contents'
import { ComponentMap, getMDXComponent } from 'mdx-bundler/client'
import { GetStaticPaths, GetStaticProps } from 'next'
import NextImage from 'next/image'
import NextLink from 'next/link'
import * as React from 'react'
import styled, { css } from 'styled-components'

const barHeight = 70
const barBottomMargin = 60

type RelatedArticle = {
  title: string
  slug: string
  thumbnailImageSrc: string | null
}

type Props = {
  slug: string
  title: string
  tags: Array<string>
  headerImageSrc: string | null
  tableOfContents: Root
  readingTime: string
  publishedOn: number
  contentCode: string
  newerArticle: RelatedArticle | null
  olderArticle: RelatedArticle | null
}

function ArticlePage(props: Props) {
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

  return (
    <TableOfContentsProvider tableOfContents={props.tableOfContents}>
      <Wrapper>
        <Aside />
        <Main>
          <Header>
            <Info>
              <InfoItem>
                <CalendarIcon width={12} height={12} />
                <span>{formatDate(props.publishedOn)}</span>
              </InfoItem>
              <InfoItem>
                <ClockIcon width={12} height={12} />
                <span>{props.readingTime}</span>
              </InfoItem>
            </Info>
            <Title>{props.title}</Title>
            {props.tags.length > 0 && (
              <Tags>
                {props.tags.map((tag) => (
                  <NextLink
                    key={tag}
                    href={`/writing?tags=${tag}`}
                    passHref={true}
                  >
                    <Tag>
                      {/* TODO: use hashtag icon instead of character */}
                      <TagIcon>#</TagIcon>
                      {tag}
                    </Tag>
                  </NextLink>
                ))}
              </Tags>
            )}
            <HeaderImageWrapper>
              <StyledParallax multiplier={-0.025} clampTo={10}>
                {props.headerImageSrc && (
                  <NextImage
                    src={props.headerImageSrc}
                    layout="fill"
                    objectFit="cover"
                    priority
                  />
                )}
              </StyledParallax>
            </HeaderImageWrapper>
          </Header>
          <Content components={components} />
          <ViewCount>{viewCount.value} views</ViewCount>
          <Thanks>
            <ThanksTitle>Thanks for reading!</ThanksTitle>
            <ThanksDescription>
              I would love to hear your thoughts, all feedback is very much
              welcome. You can find me on{' '}
              <a href="https://twitter.com/bursetAgustin">Twitter</a> or via{' '}
              <a href="mailto:tinos.corner@icloud.com">email</a>.
            </ThanksDescription>
            <LikeButton onClick={() => likeCount.toggleUserLike()}>
              <LikeButtonIcon
                className={clsx({ liked: likeCount.hasUserLike })}
              />
              {likeCount.value}
            </LikeButton>
          </Thanks>
          <EditOnGitHubWrapper>
            <EditOnGitHubLabel>Found a typo?</EditOnGitHubLabel>
            <EditOnGitHubLink
              href={editOnGitHubURL(
                'tino-brst',
                'personal-site',
                `articles/${props.slug}.mdx`
              )}
              target="_blank"
            >
              <EditOnGitHubIcon />
              Edit on GitHub
            </EditOnGitHubLink>
          </EditOnGitHubWrapper>
        </Main>
        <Aside>
          <RightSideContent>
            {props.tableOfContents.children.length > 0 && (
              <AsideSection>
                <AsideSectionHeader>
                  In this article
                  <ListBulletIcon width={18} height={18} />
                </AsideSectionHeader>
                <AsideTableOfContents />
              </AsideSection>
            )}
          </RightSideContent>
        </Aside>
      </Wrapper>
      <UpNext>
        <ArticleList>
          <ArticleListItem>
            {props.newerArticle && (
              <NextLink
                href={`/writing/${props.newerArticle.slug}`}
                passHref={true}
              >
                <ArticleLink className="next">
                  <ArticleImageWrapper>
                    {props.newerArticle.thumbnailImageSrc && (
                      <ArticleImage
                        src={props.newerArticle.thumbnailImageSrc}
                        layout="fill"
                        objectFit="cover"
                      />
                    )}
                  </ArticleImageWrapper>
                  <ArticleDescription>
                    <ArticleTitle>{props.newerArticle.title}</ArticleTitle>
                    <ArticleLabel>Next</ArticleLabel>
                  </ArticleDescription>
                </ArticleLink>
              </NextLink>
            )}
          </ArticleListItem>
          <ArticleListItem>
            {props.olderArticle && (
              <NextLink
                href={`/writing/${props.olderArticle.slug}`}
                passHref={true}
              >
                <ArticleLink className="previous">
                  <ArticleImageWrapper>
                    {props.olderArticle.thumbnailImageSrc && (
                      <ArticleImage
                        src={props.olderArticle.thumbnailImageSrc}
                        layout="fill"
                        objectFit="cover"
                      />
                    )}
                  </ArticleImageWrapper>
                  <ArticleDescription>
                    <ArticleTitle>{props.olderArticle.title}</ArticleTitle>
                    <ArticleLabel>Previously</ArticleLabel>
                  </ArticleDescription>
                </ArticleLink>
              </NextLink>
            )}
          </ArticleListItem>
        </ArticleList>
        <NextLink href="/writing" passHref={true}>
          <AllArticlesLink>
            <ArrowLeftIcon width={20} height={20} />
            All Articles
          </AllArticlesLink>
        </NextLink>
      </UpNext>
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
        {/* TODO: probably shouldn't be shown if the entire article fits in the view, even if it does have multiple headings (see back-to-top button) */}
        <TableOfContentsWrapper
          className={clsx({ open: isTableOfContentsOpen })}
          ref={tableOfContentsRef}
        >
          <TableOfContentsHeader>In this article</TableOfContentsHeader>
          <TableOfContents onSelect={closeTableOfContents} />
        </TableOfContentsWrapper>
      </FloatingStuff>
    </TableOfContentsProvider>
  )
}

function backToTop() {
  window.scroll({ behavior: 'smooth', top: 0 })
}

function editOnGitHubURL(
  username: string,
  repo: string,
  file: string,
  branch = 'main'
): string {
  return `https://github.com/${username}/${repo}/edit/${branch}/${file}`
}

const components: ComponentMap = {
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
  p: Paragraph,
  pre: CodeBlock,
  code: Code,
  img: Image,
  a: Link,
  strong: Strong,
}

type PathParams = {
  slug: string
}

const getStaticPaths: GetStaticPaths<PathParams> = async () => {
  const articles = await getArticles()

  return {
    paths: articles.map(({ slug }) => ({ params: { slug } })),
    fallback: false,
  }
}

const getStaticProps: GetStaticProps<Props, PathParams> = async (context) => {
  const articles = (await getArticles()).sort((a, b) =>
    compareDatesDesc(a.publishedOn, b.publishedOn)
  )

  const articleIndex = articles.findIndex(
    (article) => article.slug === context.params!.slug
  )

  const article = articles[articleIndex]
  const newerArticle = articles[articleIndex - 1]
  const olderArticle = articles[articleIndex + 1]

  return {
    props: {
      slug: article.slug,
      title: article.title,
      tags: article.tags,
      headerImageSrc: article.headerImage ?? null,
      readingTime: article.readingTime,
      publishedOn: article.publishedOn.getTime(),
      contentCode: article.contentCode,
      tableOfContents: article.tableOfContents,
      newerArticle: newerArticle
        ? {
            title: newerArticle.title,
            slug: newerArticle.slug,
            thumbnailImageSrc: newerArticle.headerImage ?? null,
          }
        : null,
      olderArticle: olderArticle
        ? {
            title: olderArticle.title,
            slug: olderArticle.slug,
            thumbnailImageSrc: olderArticle.headerImage ?? null,
          }
        : null,
    },
  }
}

const Wrapper = styled.div`
  isolation: isolate;
  display: flex;
  align-items: flex-start;
  margin-bottom: 48px;
`

const Aside = styled.aside`
  flex: 1;
  display: none;
  position: sticky;
  top: ${barHeight + barBottomMargin}px;

  @media (min-width: 768px) {
    display: revert;
  }
`

const RightSideContent = styled.div`
  margin-left: 24px;
  margin-right: 16px;
  display: none;

  /* TODO: clean-up magic numbers */
  @media (min-width: calc(768px + 300px * 2)) {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }
`

const AsideSection = styled.section``

const AsideSectionHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 10px;
  color: hsla(0 0% 0% / 0.3);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 16px;
`

const Main = styled.main`
  flex: 0 1 calc(768px + 2 * 16px);
  padding-right: 24px;
  padding-left: 24px;
  max-width: min(100vw, calc(768px + 2 * 16px));

  @media (min-width: 640px) {
    padding-left: 40px;
    padding-right: 40px;
  }
`

const Header = styled.header``

const Info = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 14px;
  font-weight: 500;
  color: hsla(0 0% 0% / 0.3);
`

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const Title = styled.h1`
  color: black;
  font-size: 2.2rem;
  font-weight: 600;
  margin-top: 18px;
  margin-bottom: 20px;
`

const Tags = styled.div`
  --gap: 8px;
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
    margin: 0;
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
  gap: 0.4ch;
  font-size: 14px;
  font-weight: 500;
  color: hsl(0 0% 0% / 0.7);
  background-color: hsla(0 0% 0% / 0.03);
  border-radius: 8px;
  padding: 6px 10px;
  scroll-snap-align: start;

  transition-property: transform, background-color;
  transition-duration: 0.1s;
  transition-timing-function: ease-in-out;

  &:not(:last-child) {
    margin-right: var(--gap);
  }

  &:hover {
    background-color: hsla(0 0% 0% / 0.06);
  }

  &:active {
    background-color: hsla(0 0% 0% / 0.08);
    transform: scale(0.95);
  }
`

const TagIcon = styled.span`
  color: hsl(0 0% 0% / 0.3);
`

const HeaderImageWrapper = styled.div`
  position: relative;
  aspect-ratio: 2 / 1;
  margin-left: -24px;
  margin-right: -24px;
  margin-top: 32px;
  margin-bottom: 28px;
  overflow: hidden;
  box-shadow: inset 0 -1px 0 hsla(0 0% 0% / 0.05),
    inset 0 1px 0 hsla(0 0% 0% / 0.05);

  @media (min-width: 640px) {
    box-shadow: inset 0 0 0 1px hsla(0 0% 0% / 0.05);
    border-radius: 12px;
  }
`

const StyledParallax = styled(Parallax)`
  position: absolute;
  z-index: -1;
  top: -10px;
  bottom: -10px;
  left: 0;
  right: 0;
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

  @media (min-width: calc(768px + 300px * 2)) {
    display: none;
  }
`

const ButtonGroup = styled.div`
  --button-width: 46px;
  --divider-width: 1px;

  pointer-events: auto;
  color: black;
  z-index: 1;
  overflow: hidden;
  flex-shrink: 0;
  height: 44px;
  align-self: flex-end;
  display: flex;
  justify-content: right;
  border-radius: 12px;
  background: hsla(0 0% 99% / 0.9);
  backdrop-filter: saturate(180%) blur(20px);
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.04), 0px 10px 60px rgba(0, 0, 0, 0.1),
    0px 0px 0px 1px rgba(0, 0, 0, 0.05);
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
  background-color: hsla(0 0% 0% / 0.05);
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
    background-color: hsla(0 0% 0% / 0.03);
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

const TableOfContentsWrapper = styled.div`
  visibility: hidden;
  pointer-events: auto;
  opacity: 0;
  transform: translateY(8px) scale(0.9);
  transform-origin: bottom right;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 304px;
  border-radius: 14px;
  background: hsla(0 0% 98% / 0.9);
  backdrop-filter: saturate(180%) blur(20px);
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.04), 0px 10px 60px rgba(0, 0, 0, 0.1),
    0px 0px 0px 1px rgba(0, 0, 0, 0.05);

  transition-property: opacity, transform, visibility;
  transition-duration: 0.2s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.25, 1);

  &.open {
    visibility: visible;
    opacity: 1;
    transform: none;
  }
`

const TableOfContentsHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: hsla(0 0% 100% / 0.7);
  box-shadow: 0 1px hsla(0 0% 0% / 0.05);
  color: hsla(0 0% 0% / 0.3);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 500;
`

const UpNext = styled.div`
  max-width: calc(768px + 2 * 16px);
  margin-left: auto;
  margin-right: auto;
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 48px;

  display: flex;
  flex-direction: column;
  position: relative;
  gap: 32px;

  &::before {
    position: absolute;
    top: 0;
    left: 16px;
    right: 16px;
    display: block;
    content: '';
    height: 1px;
    background-color: hsla(0 0% 0% / 0.08);
  }

  @media (min-width: 640px) {
    padding-left: 40px;
    padding-right: 40px;

    &::before {
      left: 32px;
      right: 32px;
    }
  }
`

const ArticleList = styled.ol`
  --gap: 16px;

  display: flex;
  flex-direction: column;
  gap: var(--gap);

  @media (min-width: 640px) {
    flex-direction: row-reverse;
  }
`

const ArticleListItem = styled.li`
  flex: 0 0 calc(50% - var(--gap) / 2);
`

const ArticleLink = styled.a`
  --padding: 12px;

  height: 100%;
  border-radius: 16px;
  background-color: hsla(0 0% 0% / 0.03);

  display: flex;
  padding: var(--padding);
  gap: var(--padding);

  transition-property: transform, background-color;
  transition-duration: 0.15s;
  transition-timing-function: ease-in-out;

  /* TODO: all hover states should also be applied while active, like below */
  &:hover,
  &:active {
    background-color: hsla(0 0% 0% / 0.05);
  }

  &:active {
    transform: scale(0.99);
  }

  @media (min-width: 640px) {
    flex-direction: column;
  }
`

const ArticleImageWrapper = styled.div`
  --border-radius: 6px;

  position: relative;
  aspect-ratio: 4 / 3;
  flex: 1 1 0;
  border-radius: var(--border-radius);
  overflow: hidden;

  /* Fixes corner overflow on image scale transition */
  -webkit-mask-image: -webkit-radial-gradient(white, black);

  &::after {
    position: absolute;
    content: '';
    inset: 0;
    border-radius: var(--border-radius);
    box-shadow: inset 0 0 0 1px hsla(0 0% 0% / 0.1);

    transition-property: background-color;
    transition-duration: 0.5s;
    transition-timing-function: cubic-bezier(0.4, 0, 0.25, 1);
  }

  ${ArticleLink}:hover &::after,
  ${ArticleLink}:active &::after {
    background-color: hsla(0 0% 0% / 0.08);
  }

  @media (min-width: 640px) {
    --border-radius: 6px;

    aspect-ratio: 2 / 1;
    flex: 0 0 auto;
  }
`

const ArticleImage = styled(NextImage)`
  transition-property: transform;
  transition-duration: 0.4s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.25, 1);

  ${ArticleLink}:hover &,
  ${ArticleLink}:active & {
    transform: scale(1.03);
  }
`

const ArticleDescription = styled.div`
  flex: 2 1 0;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  padding: 2px;
  padding-left: 0;

  @media (min-width: 640px) {
    flex: 1 0 auto;
    padding: 4px;
    padding-top: 0;
    margin-top: -2px;

    ${ArticleLink}.next & {
      align-items: flex-end;
      text-align: right;
    }
  }
`

const ArticleTitle = styled.h2`
  font-weight: 550;
  font-size: 16px;
  letter-spacing: 0.01em;
  line-height: 1.3em;
  color: hsla(0 0% 0% / 0.8);

  @media (min-width: 640px) {
    font-size: 18px;
  }
`

const ArticleLabel = styled.div`
  font-weight: 550;
  font-size: 14px;
  letter-spacing: 0.01em;
  color: hsla(0 0% 0% / 0.4);
  line-height: 1;

  display: flex;
  justify-content: start;
  align-items: center;
  gap: 2px;

  ${ArticleLink}.previous & {
    flex-direction: row-reverse;
  }
`

const AllArticlesLink = styled.a`
  align-self: center;
  padding: 12px 14px;
  font-weight: 500;
  background-color: hsla(0 0% 0% / 0.03);
  color: black;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  transition-property: transform, background-color;
  transition-duration: 0.15s;
  transition-timing-function: ease-in-out;

  &:hover,
  &:active {
    background-color: hsla(0 0% 0% / 0.06);
  }

  &:active {
    transform: scale(0.96);
  }
`

const Thanks = styled.div`
  padding: 24px;
  padding-top: 28px;
  border-radius: 16px;
  background-color: hsla(0 0% 0% / 0.03);
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
  color: hsla(0 0% 0% / 0.8);
`

const ThanksDescription = styled.p`
  margin-top: 16px;
  text-align: center;
  font-size: 16px;
  font-weight: 450;
  line-height: 1.5;
  color: hsla(0 0% 0% / 0.5);

  & a {
    color: hsla(0 0% 0% / 0.6);
    font-weight: 500;
    text-decoration-line: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 1px;
    text-decoration-color: hsla(0 0% 0% / 0.1);

    transition-property: text-decoration-color, color;
    transition-duration: 0.15s;
  }

  & a:hover {
    color: hsla(0 0% 0% / 0.7);
    text-decoration-color: hsla(0 0% 0% / 0.2);
  }
  @media (min-width: 640px) {
    font-weight: 400;

    & a {
      font-weight: 450;
    }
  }
`

const LikeButton = styled.button`
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
`

const LikeButtonIcon = styled(HeartFilledIcon)`
  color: hsla(0 0% 0% / 0.2);
  width: 24px;
  height: 24px;

  transition: color 0.15s;

  &.liked {
    color: hsla(0 0% 0% / 0.8);
  }
`

const EditOnGitHubWrapper = styled.div`
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
`

const EditOnGitHubLabel = styled.span`
  color: hsla(0 0% 0% / 0.4);
  font-size: 14px;
  font-weight: 500;
`

const EditOnGitHubLink = styled.a`
  align-self: center;
  height: 44px;
  line-height: 1;
  padding: 12px 14px;
  font-weight: 500;
  background-color: hsla(0 0% 0% / 0.03);
  color: black;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  transition-property: transform, background-color;
  transition-duration: 0.15s;
  transition-timing-function: ease-in-out;

  &:hover,
  &:active {
    background-color: hsla(0 0% 0% / 0.06);
  }

  &:active {
    transform: scale(0.96);
  }
`

const EditOnGitHubIcon = styled(GitHubLogoIcon)`
  width: 18px;
  height: 18px;
  margin-right: 2px;
`

const ViewCount = styled.div`
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
  margin-top: 32px;
  color: hsla(0 0% 0% / 0.2);
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
`

export default ArticlePage
export { getStaticPaths, getStaticProps }
