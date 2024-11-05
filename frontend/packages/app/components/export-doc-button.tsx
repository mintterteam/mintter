import {HMBlockNode, getDocumentTitle, toHMBlock} from '@mintter/shared'
import {Button, Tooltip, toast} from '@mintter/ui'
import {Download} from '@tamagui/lucide-icons'
import {SizableText, YStack} from 'tamagui'
import {useAppContext} from '../app-context'
import {usePublication} from '../models/documents'
import {convertBlocksToMarkdown} from '../utils/blocks-to-markdown'

export const ExportDocButton = ({
  docId,
  version,
}: {
  docId: string | undefined
  version: string | undefined
}) => {
  const pub = usePublication({id: docId, version: version})
  const title = getDocumentTitle(pub.data?.document)
  const {exportDocument, openDirectory} = useAppContext()
  return (
    <>
      <Tooltip content={'Export Document to Markdown'}>
        <Button
          size="$2"
          theme="blue"
          onPress={async () => {
            const blocks: HMBlockNode[] | undefined =
              pub.data?.document?.children
            const editorBlocks = toHMBlock(blocks)

            const markdownWithFiles = await convertBlocksToMarkdown(
              editorBlocks,
              pub.data!.document!,
            )

            const {markdownContent, mediaFiles} = markdownWithFiles
            exportDocument(title, markdownContent, mediaFiles)
              .then((res) => {
                const success = (
                  <>
                    <YStack gap="$1.5" maxWidth={700}>
                      <SizableText
                        wordWrap="break-word"
                        textOverflow="break-word"
                      >
                        Successfully exported document "{title}" to:{' '}
                        <b>{`${res}`}</b>.
                      </SizableText>
                      <SizableText
                        textDecorationLine="underline"
                        color="$blue9"
                        tag={'a'}
                        onPress={() => {
                          openDirectory(res)
                        }}
                      >
                        Show directory
                      </SizableText>
                    </YStack>
                  </>
                )
                toast.success('', {customContent: success})
              })
              .catch((err) => {
                toast.error(err)
              })
          }}
          icon={Download}
        >
          Export
        </Button>
      </Tooltip>
    </>
  )
}
