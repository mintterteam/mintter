import {HMBlock, HMDocument} from '@mintter/shared'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkGfm from 'remark-gfm'
import remarkStringify from 'remark-stringify'
import {unified} from 'unified'

function applyStyles(text, styles) {
  if (styles.bold) text = `<b>${text}</b>`
  if (styles.italic) text = `<i>${text}</i>`
  if (styles.strike) text = `<del>${text}</del>`
  if (styles.underline) text = `<u>${text}</u>`
  if (styles.code) text = `<code>${text}</code>`
  return text
}

function convertContentItemToHtml(
  contentItem,
  docMap?: Map<string, {name: string; path: string}>,
) {
  let text = contentItem.text || ''
  const {styles = {}} = contentItem

  text = applyStyles(text, styles)

  if (contentItem.type === 'link') {
    const linkText = applyStyles(
      contentItem.content[0].text,
      contentItem.content[0].styles || {},
    )
    let docPath = contentItem.href
    if (docMap) docPath = docMap.get(contentItem.href)
    return `<a href="${docPath}">${linkText}</a>`
  } else {
    return text
  }
}

function convertBlockToHtml(
  block,
  isListItem = false,
  docMap?: Map<string, {name: string; path: string}>,
) {
  let childrenHtml = ''
  if (block.children) {
    const childrenContent = block.children
      .map((child) =>
        convertBlockToHtml(
          child,
          block.props.childrenType === 'ul' ||
            block.props.childrenType === 'ol',
          docMap,
        ),
      )
      .join('\n')
    if (block.props.childrenType === 'ul') {
      childrenHtml = `<ul>${childrenContent}</ul>`
    } else if (block.props.childrenType === 'ol') {
      childrenHtml = `<ol start="${
        block.props.start || 1
      }">${childrenContent}</ol>`
    } else {
      childrenHtml = childrenContent
    }
  }

  const contentHtml = block.content
    ? block.content
        .map((contentItem) => convertContentItemToHtml(contentItem, docMap))
        .join('')
    : ''

  const blockHtml = (() => {
    switch (block.type) {
      case 'heading':
        return `<h${block.props.level}>${contentHtml}</h${block.props.level}>`
      case 'paragraph':
        return `<p>${contentHtml}</p>`
      case 'image':
        const {url, name, width} = block.props
        const titleWithWidth = `${name} | width=${width}`
        return `<img src="${url}" alt=\"${contentHtml}\" title="${titleWithWidth}">`
      case 'codeBlock':
        return `<pre><code class="language-${
          block.props.language || 'plaintext'
        }">${contentHtml}</code></pre>`
      case 'video':
        return `<p>![${block.props.name}](${block.props.url} "width=${block.props.width}")</p>`
      case 'file':
        return `<p>[${block.props.name}](${block.props.url} "size=${block.props.size}")</p>`
      case 'web-embed':
        return `<p>[[tweet(${block.props.url})]]</p>`
      case 'math' || 'equation':
        return `<p>$$${contentHtml}$$</p>`
      default:
        return contentHtml
    }
  })()

  if (isListItem) {
    // Wrap the block content in <li> if it's a list item
    return `<li>${blockHtml}${childrenHtml}</li>`
  } else {
    // Return the block content and any children it may have
    return `${blockHtml}\n${childrenHtml}`
  }
}

function convertBlocksToHtml(
  blocks: HMBlock[],
  docMap?: Map<string, {name: string; path: string}>,
) {
  const htmlContent: string = blocks
    .map((block) => convertBlockToHtml(block, undefined, docMap))
    .join('\n\n')
  return htmlContent
}

async function extractMediaFiles(blocks: HMBlock[]) {
  const mediaFiles: {url: string; filename: string; placeholder: string}[] = []
  let counter = 1
  const extractMedia = async (block) => {
    if (
      block.type === 'image' ||
      block.type === 'video' ||
      block.type === 'file'
    ) {
      const url = block.props.url
      if (url) {
        if (
          url.includes('youtu.be') ||
          url.includes('youtube') ||
          url.includes('vimeo')
        ) {
          return
        }
        const filename = url.split('/').pop()
        const placeholder = `file-${counter}`
        mediaFiles.push({url, filename, placeholder})
        counter++
        // Update the URL to point to the local media folder
        block.props = {...block.props, url: `media/${placeholder}`}
      }
    }
    if (block.children) {
      for (const child of block.children) {
        await extractMedia(child)
      }
    }
  }
  for (const block of blocks) {
    await extractMedia(block)
  }
  return mediaFiles
}

export async function convertBlocksToMarkdown(
  blocks: HMBlock[],
  document: HMDocument,
  docMap?: Map<string, {name: string; path: string}>,
) {
  const frontMatter = `---
title: ${document.title || ''}
created_at: ${document.createTime}
---

`
  const mediaFiles = await extractMediaFiles(blocks)
  const markdownFile = await unified()
    .use(rehypeParse, {fragment: true})
    .use(rehypeRemark)
    // .use(addImageWidth)
    .use(remarkGfm)
    .use(remarkStringify)
    .process(convertBlocksToHtml(blocks, docMap))
  const markdownContent = (frontMatter +
    (document.title
      ? `# ${document.title}\n\n${markdownFile.value}`
      : markdownFile.value)) as string
  return {markdownContent, mediaFiles}
}

// import {visit} from 'unist-util-visit'

// function addImageWidth() {
//   return (tree) => {
//     visit(tree, 'image', (node) => {
//       console.log(node)
//       const width = node.width
//       console.log(width)

//       if (width) {
//         // Inject width into the title attribute
//         node.title = node.title
//           ? `${node.title} "width=${width}"`
//           : `"width=${width}"`
//       }
//     })
//   }
// }
