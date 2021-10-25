export default interface Metadata {
  /**
   * Match data version.
  */
  dataVersion: string
  /**
   * Match id.
  */
  matchId: string
  /**
   * A list of participant PUUIDs.
  */
  participants: Array<String>
}
