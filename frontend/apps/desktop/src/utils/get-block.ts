import {publicationsClient} from '@app/api-clients'
import {
  blockNodeToSlate,
  FlowContent,
  LinkNode,
  Publication,
} from '@mintter/shared'
import {visit} from 'unist-util-visit'

export type GetBlockResult = {
  publication: Publication
  block: FlowContent
}

export async function getBlock(
  entry?: LinkNode,
): Promise<GetBlockResult | undefined> {
  if (!entry) return
  let publication = await publicationsClient.getPublication({
    documentId: entry.documentId,
  })

  let block: FlowContent

  if (publication.document) {
    // TODO: use the parent list type instead
    let content = blockNodeToSlate(publication.document.children, 'group')
    if (content) {
      visit(content, {id: entry.blockId}, (node) => {
        block = node
      })
    }

    return {
      publication: {
        ...publication,
        document: {
          ...publication.document,
          //@ts-ignore
          content: [content],
        },
      },
      //@ts-ignore
      block,
    }
  }
}