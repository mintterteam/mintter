import {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next'
import PublicationPage from '../../publication-page'
import {impatiently} from 'server/impatiently'
import {getPageProps, serverHelpers} from 'server/ssr-helpers'
import {useRequiredRouteQuery, useRouteQuery} from 'server/router-queries'
import {setResponsePublication} from 'server/server-publications'

export default function IDPublicationPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  return (
    <PublicationPage
      documentId={useRequiredRouteQuery('docId')}
      version={useRouteQuery('v')}
    />
  )
}

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const {params, query} = context
  let docId = params?.docId ? String(params.docId) : undefined
  let version = query.v ? String(query.v) : null
  if (!docId) return {notFound: true}

  const helpers = serverHelpers({})

  await impatiently(
    helpers.publication.get.prefetch({
      documentId: docId,
      versionId: version || undefined,
    }),
  )

  setResponsePublication(context, docId, version)

  return {
    props: await getPageProps(helpers, {}),
  }
}