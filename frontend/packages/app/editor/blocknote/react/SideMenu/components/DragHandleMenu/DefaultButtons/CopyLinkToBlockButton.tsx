import {BlockSchema} from '@shm/app/editor/blocknote/core'

import {usePublicationContentContext} from '@shm/shared'
import {Link, XStack} from '@shm/ui'
import {DragHandleMenuProps} from '../DragHandleMenu'
import {DragHandleMenuItem} from '../DragHandleMenuItem'

export const CopyLinkToBlockButton = <BSchema extends BlockSchema>({
  block,
}: DragHandleMenuProps<BSchema>) => {
  const {onCopyBlock} = usePublicationContentContext()
  if (!onCopyBlock) return null
  return (
    <DragHandleMenuItem
      onClick={() => {
        onCopyBlock(block.id)
      }}
    >
      <XStack gap="$2">
        <Link size={14} />
        Copy link to Block
      </XStack>
    </DragHandleMenuItem>
  )
}