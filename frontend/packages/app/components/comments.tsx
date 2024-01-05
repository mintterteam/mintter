import {trpc} from '@mintter/desktop/src/trpc'
import {
  BACKEND_FILE_URL,
  BlocksContent,
  HMComment,
  StateStream,
  UnpackedHypermediaId,
  createHmId,
  formattedDateMedium,
  unpackHmId,
} from '@mintter/shared'
import {
  Button,
  SizableText,
  UIAvatar,
  View,
  XStack,
  useStream,
} from '@mintter/ui'
import {
  ArrowUpRight,
  Copy,
  MessageSquare,
  Pencil,
  Reply,
} from '@tamagui/lucide-icons'
import {YStack} from 'tamagui'
import {copyUrlToClipboardWithFeedback} from '../copy-to-clipboard'
import {useAccount} from '../models/accounts'
import type {CommentGroup} from '../models/comments'
import {
  useCommentReplies,
  usePublicationCommentGroups,
} from '../models/comments'
import {usePublication} from '../models/documents'
import {AppPublicationContentProvider} from '../pages/publication'
import {useNavigate} from '../utils/useNavigate'
import {AccessoryContainer} from './accessory-sidebar'
import {MenuItemType, OptionsDropdown} from './options-dropdown'

export function CommentGroup({
  group,
  targetDocEid,
  targetDocVersion,
}: {
  group: CommentGroup
  targetDocEid: string
  targetDocVersion: string
}) {
  const createComment = trpc.comments.createCommentDraft.useMutation()
  const navigate = useNavigate()
  const spawn = useNavigate('spawn')
  return (
    <YStack position="relative">
      <View
        backgroundColor={'$borderColor'}
        position="absolute"
        width={1}
        top={20}
        bottom={20}
        left={28}
      />
      {group.comments?.map((comment) => {
        if (!comment.createTime) return null
        const lastComment = group.comments.at(-1)
        return (
          <CommentPresentation
            key={comment.id}
            comment={comment}
            menuItems={[
              {
                key: 'reply',
                label: 'Reply',
                icon: Reply,
                onPress: () => {
                  createComment
                    .mutateAsync({
                      targetDocEid,
                      targetDocVersion,
                      targetCommentId: comment.id,
                    })
                    .then((commentId) => {
                      navigate({
                        key: 'comment-draft',
                        commentId,
                      })
                    })
                },
              },
              {
                key: 'copyLink',
                label: 'Copy Link',
                icon: Copy,
                onPress: () => {
                  copyUrlToClipboardWithFeedback(comment.id, 'Comment')
                },
              },
              {
                key: 'openNewWindow',
                label: 'Open in New Window',
                icon: ArrowUpRight,
                onPress: () => {
                  spawn({
                    key: 'comment',
                    commentId: comment.id,
                    showThread: false,
                  })
                },
              },
            ]}
            onReplyBlock={(blockId: string) => {
              if (!lastComment) return
              const targetId = unpackHmId(lastComment.id)
              if (!targetId) return
              createComment
                .mutateAsync({
                  targetDocEid,
                  targetCommentId: lastComment.id,
                  targetDocVersion,
                  blocks: [
                    {
                      block: {
                        type: 'embed',
                        attributes: {},
                        ref: createHmId('c', targetId.eid, {
                          blockRef: blockId,
                        }),
                      },
                      children: [],
                    },
                  ],
                })
                .then((commentId) => {
                  navigate({
                    key: 'comment-draft',
                    commentId,
                  })
                })
            }}
          />
        )
      })}
      <XStack>
        {group.moreCommentsCount ? (
          <Button
            size="$2"
            marginHorizontal="$4"
            onPress={() => {
              const lastComment = group.comments.at(-1)
              if (!lastComment) throw new Error('lastComment not here')
              spawn({
                key: 'comment',
                commentId: lastComment?.id,
              })
            }}
            icon={MessageSquare}
          >
            {`${group.moreCommentsCount}${
              group.comments.length > 1 ? ' More' : ''
            } Replies`}
          </Button>
        ) : (
          <Button
            size="$2"
            marginHorizontal="$4"
            onPress={() => {
              const lastComment = group.comments.at(-1)
              if (!lastComment) return
              createComment
                .mutateAsync({
                  targetDocEid,
                  targetDocVersion,
                  targetCommentId: lastComment.id,
                })
                .then((draftId) => {
                  navigate({
                    key: 'comment-draft',
                    commentId: draftId,
                  })
                })
            }}
            icon={Reply}
          >
            Reply
          </Button>
        )}
      </XStack>
    </YStack>
  )
}

export function CommentThread({
  targetCommentId,
  targetDocEid,
  onReplyBlock,
}: {
  targetCommentId: string
  targetDocEid: string
  onReplyBlock: (commentId: string, blockId: string) => void
}) {
  const thread = useCommentReplies(targetCommentId, targetDocEid)
  return (
    <>
      <YStack borderBottomWidth={1} borderColor="$borderColor">
        {thread?.map((comment) => {
          if (!comment) return null
          return (
            <CommentPresentation
              key={comment.id}
              comment={comment}
              onReplyBlock={(blockId) => {
                onReplyBlock(comment.id, blockId)
              }}
            />
          )
        })}
      </YStack>
    </>
  )
}

export function EntityCommentsAccessory({
  id,
  activeVersion,
}: {
  id: UnpackedHypermediaId
  activeVersion: string
}) {
  const navigate = useNavigate()
  const commentGroups = usePublicationCommentGroups(id.eid)
  const createComment = trpc.comments.createCommentDraft.useMutation()
  return (
    <AccessoryContainer
      title="Comments"
      footer={
        <YStack padding="$4" borderTopWidth={1} borderColor="$borderColor">
          <Button
            size="$3"
            icon={Pencil}
            onPress={() => {
              createComment
                .mutateAsync({
                  targetDocEid: id.eid,
                  targetDocVersion: activeVersion,
                  targetCommentId: null,
                })
                .then((commentId) => {
                  navigate({
                    key: 'comment-draft',
                    commentId,
                  })
                })
            }}
          >
            Write a Comment
          </Button>
        </YStack>
      }
    >
      <YStack gap="$5" paddingBottom="$4">
        {commentGroups.map((group) => (
          <CommentGroup
            group={group}
            key={group.id}
            targetDocEid={id.eid}
            targetDocVersion={activeVersion}
          />
        ))}
      </YStack>
    </AccessoryContainer>
  )
}

export function CommentPresentation({
  comment,
  menuItems,
  onReplyBlock,
}: {
  comment: HMComment
  menuItems?: (MenuItemType | null)[]
  onReplyBlock?: (blockId: string) => void
}) {
  const account = useAccount(comment.author)
  return (
    <YStack group="item" marginVertical="$3" paddingHorizontal="$3">
      <XStack jc="space-between" paddingHorizontal="$2" marginBottom="$2">
        <XStack gap="$2">
          <UIAvatar
            label={account.data?.profile?.alias}
            id={account.data?.id}
            url={
              account.data?.profile?.avatar
                ? `${BACKEND_FILE_URL}/${account.data?.profile?.avatar}`
                : undefined
            }
          />
          <SizableText>{account.data?.profile?.alias}</SizableText>
        </XStack>

        {menuItems ? (
          <OptionsDropdown menuItems={menuItems || []} hiddenUntilItemHover />
        ) : null}
      </XStack>
      {comment.createTime ? (
        <XStack paddingHorizontal="$2" paddingLeft={34}>
          <SizableText fontSize="$2" color="$color8">
            {formattedDateMedium(comment.createTime)}
          </SizableText>
        </XStack>
      ) : null}
      <YStack paddingHorizontal="$2" paddingLeft={28}>
        <AppPublicationContentProvider
          onReplyBlock={onReplyBlock}
          onCopyBlock={(blockId: string) => {
            const url = `${comment.id}#${blockId}`
            copyUrlToClipboardWithFeedback(url, 'Comment Block')
          }}
        >
          <BlocksContent blocks={comment.content} />
        </AppPublicationContentProvider>
      </YStack>
    </YStack>
  )
}

export function CommentPageTitlebar({
  icon,
  title,
}: {
  icon?: React.ReactNode
  title?: string
}) {
  return (
    <XStack
      height={40}
      borderBottomWidth={1}
      borderColor="$borderColor"
      backgroundColor={'$blue2'}
      ai="center"
      jc="center"
      paddingHorizontal="$2"
      className="window-drag"
    >
      <XStack ai="center" gap="$2">
        {icon || <MessageSquare size={12} />}
        <SizableText size="$4">{title || 'Comment'}</SizableText>
      </XStack>
    </XStack>
  )
}

export function CommentPageTitlebarWithDocId({
  targetDocId,
}: {
  targetDocId: StateStream<string | null>
}) {
  const docId = useStream(targetDocId)
  const pub = usePublication({id: docId || undefined})
  return (
    <CommentPageTitlebar
      title={
        pub.data?.document?.title
          ? `Comment on ${pub.data?.document?.title}`
          : 'Comment'
      }
    />
  )
}