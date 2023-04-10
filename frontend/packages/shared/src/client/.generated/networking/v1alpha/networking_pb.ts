// @generated by protoc-gen-es v1.2.0 with parameter "target=ts,import_extension=none"
// @generated from file networking/v1alpha/networking.proto (package com.mintter.networking.v1alpha, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";

/**
 * Indicates connection status of our node with a remote peer.
 * Mimics libp2p connectedness.
 *
 * @generated from enum com.mintter.networking.v1alpha.ConnectionStatus
 */
export enum ConnectionStatus {
  /**
   * NotConnected means no connection to peer, and no extra information (default).
   *
   * @generated from enum value: NOT_CONNECTED = 0;
   */
  NOT_CONNECTED = 0,

  /**
   * Connected means has an open, live connection to peer.
   *
   * @generated from enum value: CONNECTED = 1;
   */
  CONNECTED = 1,

  /**
   * CanConnect means recently connected to peer, terminated gracefully.
   *
   * @generated from enum value: CAN_CONNECT = 2;
   */
  CAN_CONNECT = 2,

  /**
   * CannotConnect means recently attempted connecting but failed to connect.
   * (should signal "made effort, failed").
   *
   * @generated from enum value: CANNOT_CONNECT = 3;
   */
  CANNOT_CONNECT = 3,
}
// Retrieve enum metadata with: proto3.getEnumType(ConnectionStatus)
proto3.util.setEnumType(ConnectionStatus, "com.mintter.networking.v1alpha.ConnectionStatus", [
  { no: 0, name: "NOT_CONNECTED" },
  { no: 1, name: "CONNECTED" },
  { no: 2, name: "CAN_CONNECT" },
  { no: 3, name: "CANNOT_CONNECT" },
]);

/**
 * Request to get peer's addresses.
 *
 * @generated from message com.mintter.networking.v1alpha.GetPeerInfoRequest
 */
export class GetPeerInfoRequest extends Message<GetPeerInfoRequest> {
  /**
   * Required. CID-encoded Peer ID.
   *
   * @generated from field: string peer_id = 1;
   */
  peerId = "";

  constructor(data?: PartialMessage<GetPeerInfoRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "com.mintter.networking.v1alpha.GetPeerInfoRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "peer_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GetPeerInfoRequest {
    return new GetPeerInfoRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GetPeerInfoRequest {
    return new GetPeerInfoRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GetPeerInfoRequest {
    return new GetPeerInfoRequest().fromJsonString(jsonString, options);
  }

  static equals(a: GetPeerInfoRequest | PlainMessage<GetPeerInfoRequest> | undefined, b: GetPeerInfoRequest | PlainMessage<GetPeerInfoRequest> | undefined): boolean {
    return proto3.util.equals(GetPeerInfoRequest, a, b);
  }
}

/**
 * Request to get peer's addresses.
 *
 * @generated from message com.mintter.networking.v1alpha.ListPeersRequest
 */
export class ListPeersRequest extends Message<ListPeersRequest> {
  /**
   * Required. Status of the peers to list. If negative, all peers are returned, regardless of their status.
   *
   * @generated from field: com.mintter.networking.v1alpha.ConnectionStatus status = 1;
   */
  status = ConnectionStatus.NOT_CONNECTED;

  constructor(data?: PartialMessage<ListPeersRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "com.mintter.networking.v1alpha.ListPeersRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "status", kind: "enum", T: proto3.getEnumType(ConnectionStatus) },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): ListPeersRequest {
    return new ListPeersRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): ListPeersRequest {
    return new ListPeersRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): ListPeersRequest {
    return new ListPeersRequest().fromJsonString(jsonString, options);
  }

  static equals(a: ListPeersRequest | PlainMessage<ListPeersRequest> | undefined, b: ListPeersRequest | PlainMessage<ListPeersRequest> | undefined): boolean {
    return proto3.util.equals(ListPeersRequest, a, b);
  }
}

/**
 * Request for connecting to a peer explicitly.
 *
 * @generated from message com.mintter.networking.v1alpha.ConnectRequest
 */
export class ConnectRequest extends Message<ConnectRequest> {
  /**
   * A list of multiaddrs for the same peer ID to attempt p2p connection.
   * For example `/ip4/10.0.0.1/tcp/55000/p2p/QmDeadBeef`.
   *
   * @generated from field: repeated string addrs = 1;
   */
  addrs: string[] = [];

  constructor(data?: PartialMessage<ConnectRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "com.mintter.networking.v1alpha.ConnectRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "addrs", kind: "scalar", T: 9 /* ScalarType.STRING */, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): ConnectRequest {
    return new ConnectRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): ConnectRequest {
    return new ConnectRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): ConnectRequest {
    return new ConnectRequest().fromJsonString(jsonString, options);
  }

  static equals(a: ConnectRequest | PlainMessage<ConnectRequest> | undefined, b: ConnectRequest | PlainMessage<ConnectRequest> | undefined): boolean {
    return proto3.util.equals(ConnectRequest, a, b);
  }
}

/**
 * Response for conneting to a peer.
 *
 * @generated from message com.mintter.networking.v1alpha.ConnectResponse
 */
export class ConnectResponse extends Message<ConnectResponse> {
  constructor(data?: PartialMessage<ConnectResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "com.mintter.networking.v1alpha.ConnectResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): ConnectResponse {
    return new ConnectResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): ConnectResponse {
    return new ConnectResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): ConnectResponse {
    return new ConnectResponse().fromJsonString(jsonString, options);
  }

  static equals(a: ConnectResponse | PlainMessage<ConnectResponse> | undefined, b: ConnectResponse | PlainMessage<ConnectResponse> | undefined): boolean {
    return proto3.util.equals(ConnectResponse, a, b);
  }
}

/**
 * Various details about a list of peers.
 *
 * @generated from message com.mintter.networking.v1alpha.ListPeersResponse
 */
export class ListPeersResponse extends Message<ListPeersResponse> {
  /**
   * List of knwown peers matching status in the request.
   *
   * @generated from field: repeated com.mintter.networking.v1alpha.PeerIDs peerList = 1;
   */
  peerList: PeerIDs[] = [];

  constructor(data?: PartialMessage<ListPeersResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "com.mintter.networking.v1alpha.ListPeersResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "peerList", kind: "message", T: PeerIDs, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): ListPeersResponse {
    return new ListPeersResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): ListPeersResponse {
    return new ListPeersResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): ListPeersResponse {
    return new ListPeersResponse().fromJsonString(jsonString, options);
  }

  static equals(a: ListPeersResponse | PlainMessage<ListPeersResponse> | undefined, b: ListPeersResponse | PlainMessage<ListPeersResponse> | undefined): boolean {
    return proto3.util.equals(ListPeersResponse, a, b);
  }
}

/**
 * All the IDs associated with a peer.
 *
 * @generated from message com.mintter.networking.v1alpha.PeerIDs
 */
export class PeerIDs extends Message<PeerIDs> {
  /**
   * Device cid to this peer.
   *
   * @generated from field: string device_id = 1;
   */
  deviceId = "";

  /**
   * Peer ID as shown in p2p addresses.
   *
   * @generated from field: string peer_id = 2;
   */
  peerId = "";

  /**
   * Account ID that this peer is bound to.
   *
   * @generated from field: string account_id = 3;
   */
  accountId = "";

  constructor(data?: PartialMessage<PeerIDs>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "com.mintter.networking.v1alpha.PeerIDs";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "device_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "peer_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 3, name: "account_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): PeerIDs {
    return new PeerIDs().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): PeerIDs {
    return new PeerIDs().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): PeerIDs {
    return new PeerIDs().fromJsonString(jsonString, options);
  }

  static equals(a: PeerIDs | PlainMessage<PeerIDs> | undefined, b: PeerIDs | PlainMessage<PeerIDs> | undefined): boolean {
    return proto3.util.equals(PeerIDs, a, b);
  }
}

/**
 * Various details about a known peer.
 *
 * @generated from message com.mintter.networking.v1alpha.PeerInfo
 */
export class PeerInfo extends Message<PeerInfo> {
  /**
   * List of known multiaddrs of the request peer.
   *
   * @generated from field: repeated string addrs = 1;
   */
  addrs: string[] = [];

  /**
   * Connection status of our node with a remote peer.
   *
   * @generated from field: com.mintter.networking.v1alpha.ConnectionStatus connection_status = 2;
   */
  connectionStatus = ConnectionStatus.NOT_CONNECTED;

  /**
   * Account ID that this peer is bound to.
   *
   * @generated from field: string account_id = 3;
   */
  accountId = "";

  constructor(data?: PartialMessage<PeerInfo>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "com.mintter.networking.v1alpha.PeerInfo";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "addrs", kind: "scalar", T: 9 /* ScalarType.STRING */, repeated: true },
    { no: 2, name: "connection_status", kind: "enum", T: proto3.getEnumType(ConnectionStatus) },
    { no: 3, name: "account_id", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): PeerInfo {
    return new PeerInfo().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): PeerInfo {
    return new PeerInfo().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): PeerInfo {
    return new PeerInfo().fromJsonString(jsonString, options);
  }

  static equals(a: PeerInfo | PlainMessage<PeerInfo> | undefined, b: PeerInfo | PlainMessage<PeerInfo> | undefined): boolean {
    return proto3.util.equals(PeerInfo, a, b);
  }
}
