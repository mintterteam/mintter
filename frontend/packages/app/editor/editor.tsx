import {HyperDocsEditor} from '@shm/app/models/documents'
import {useOpenUrl} from '@shm/desktop/src/open-url'
import {YStack} from '@shm/ui'
import {
  BlockNoteView,
  FormattingToolbarPositioner,
  HyperlinkToolbarPositioner,
  LinkMenuPositioner,
  SideMenuPositioner,
  SlashMenuPositioner,
} from './blocknote'
import './blocknote/core/style.css'
import './editor.css'
import {HMFormattingToolbar} from './hm-formatting-toolbar'
import {HypermediaLinkToolbar} from './hyperlink-toolbar'

export function HyperMediaEditorView({
  editor,
}: {
  editor: HyperDocsEditor
  editable: boolean
}) {
  const openUrl = useOpenUrl()
  return (
    <BlockNoteView editor={editor}>
      <FormattingToolbarPositioner
        editor={editor}
        formattingToolbar={HMFormattingToolbar}
      />
      <HyperlinkToolbarPositioner
        hyperlinkToolbar={HypermediaLinkToolbar}
        editor={editor}
        openUrl={openUrl}
      />
      <SlashMenuPositioner editor={editor} />
      <SideMenuPositioner editor={editor} placement="left" />
      <LinkMenuPositioner editor={editor} />
    </BlockNoteView>
  )
}

export function HMEditorContainer({children}: {children: React.ReactNode}) {
  return (
    <YStack
      className="editor"
      onPress={(e) => {
        e.stopPropagation()
      }}
    >
      {children}
    </YStack>
  )
}