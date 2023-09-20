export const HYPERMEDIA_PUBLIC_WEB_GATEWAY = 'https://hyper.media'

export const HYPERMEDIA_SCHEME = 'hm'
export const HYPERMEDIA_ENTITY_TYPES = {
  a: 'Account',
  d: 'Document',
  g: 'Group',
} as const

export function createPublicWebHmUrl(
  type: keyof typeof HYPERMEDIA_ENTITY_TYPES,
  eid: string,
  {
    version,
    blockRef,
    hostname,
  }: {
    version?: string
    blockRef?: string
    hostname?: string | null | undefined
  } = {},
) {
  const webPath = `/${type}/${eid}`
  let urlHost =
    hostname === null
      ? ''
      : hostname === undefined
      ? HYPERMEDIA_PUBLIC_WEB_GATEWAY
      : hostname
  let webUrl = `${urlHost}${webPath}`
  if (version) webUrl += `?v=${version}`
  if (blockRef) webUrl += `#${blockRef}`
  return webUrl
}

export function createHmId(
  type: keyof typeof HYPERMEDIA_ENTITY_TYPES,
  id: string,
  opts?: {version?: string; blockRef?: string},
) {
  let outputUrl = `${HYPERMEDIA_SCHEME}://${type}/${id}`
  if (opts?.version) outputUrl += `?v=${opts.version}`
  if (opts?.blockRef) outputUrl += `#${opts.blockRef}`
  return outputUrl
}

type ParsedURL = {
  scheme: string | null
  path: string[]
  query: Record<string, string>
  fragment: string | null
}

export function parseCustomURL(url: string): ParsedURL | null {
  if (!url) return null
  const [scheme, rest] = url.split('://')
  if (!rest) return null
  const [pathAndQuery, fragment] = rest.split('#')
  const [path, queryString] = pathAndQuery.split('?')

  const query: Record<string, string> = {}
  queryString?.split('&').forEach((param) => {
    const [key, value] = param.split('=')
    query[key] = decodeURIComponent(value)
  })

  return {
    scheme,
    path: path.split('/'),
    query,
    fragment: fragment || null,
  }
}

function inKeys<V extends string>(
  key: string,
  values: Record<V, string>,
): V | null {
  // @ts-expect-error
  if (values[key]) return key as V
  return null
}

export type UnpackedHypermediaId = {
  type: keyof typeof HYPERMEDIA_ENTITY_TYPES
  eid: string
  version?: string
  blockRef?: string
  hostname?: string
  scheme?: string
}

export function unpackHmId(hypermediaId: string): UnpackedHypermediaId | null {
  const parsed = parseCustomURL(hypermediaId)
  if (parsed?.scheme === HYPERMEDIA_SCHEME) {
    const type = inKeys(parsed?.path[0], HYPERMEDIA_ENTITY_TYPES)
    const eid = parsed?.path[1]
    const version = parsed?.query.v
    if (!type) return null
    return {
      type,
      eid,
      version,
      blockRef: parsed?.fragment || undefined,
      hostname: undefined,
      scheme: parsed?.scheme,
    }
  }
  if (parsed?.scheme === 'https' || parsed?.scheme === 'http') {
    const type = inKeys(parsed?.path[1], HYPERMEDIA_ENTITY_TYPES)
    const eid = parsed?.path[2]
    const version = parsed?.query.v
    let hostname = parsed?.path[0]
    if (!type) return null
    return {
      type,
      eid,
      version,
      blockRef: parsed?.fragment || undefined,
      hostname,
      scheme: parsed?.scheme,
    }
  }
  return null
}

export function unpackDocId(
  inputUrl: string,
): (UnpackedHypermediaId & {docId: string}) | null {
  const unpackedHm = unpackHmId(inputUrl)
  if (!unpackedHm?.eid) return null
  if (unpackedHm.type !== 'd') {
    throw new Error('URL is expected to be a document ID: ' + inputUrl)
  }
  return {
    eid: unpackedHm.eid,
    type: 'd',
    docId: createHmId('d', unpackedHm.eid),
    version: unpackedHm.version,
    blockRef: unpackedHm.blockRef,
    hostname: unpackedHm.hostname,
    scheme: unpackedHm.scheme,
  }
}

export function isHypermediaScheme(url?: string) {
  return !!url?.startsWith(`${HYPERMEDIA_SCHEME}://`)
}

export function isPublicGatewayLink(text: string) {
  const matchesGateway = text.indexOf(HYPERMEDIA_PUBLIC_WEB_GATEWAY) === 0
  return !!matchesGateway
}

export function idToUrl(
  hmId: string,
  hostname?: string | null | undefined,
  versionId?: string | null | undefined,
) {
  const unpacked = unpackHmId(hmId)
  if (!unpacked?.type) return null
  return createPublicWebHmUrl(unpacked.type, unpacked.eid, {
    version: versionId || unpacked.version,
    blockRef: unpacked.blockRef,
    hostname,
  })
}

export function normlizeHmId(urlMaybe: string): string | undefined {
  if (isHypermediaScheme(urlMaybe)) return urlMaybe
  if (isPublicGatewayLink(urlMaybe)) {
    const unpacked = unpackHmId(urlMaybe)

    if (unpacked?.eid && unpacked.type) {
      return createHmId(unpacked.type, unpacked.eid, unpacked)
    }
    return undefined
  }
}

export function createHmDocLink(
  documentId: string,
  version?: string | null,
  blockRef?: string | null,
): string {
  let res = documentId
  if (version) res += `?v=${version}`
  if (blockRef) res += `${!blockRef.startsWith('#') ? '#' : ''}${blockRef}`
  return res
}