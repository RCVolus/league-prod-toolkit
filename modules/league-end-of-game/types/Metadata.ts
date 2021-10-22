export default interface Metadata {
  /**
   * Match data version.
  */
  dataVersion: string | number
  /**
   * Match id.
  */
  matchId: string
  /**
   * A list of participant PUUIDs.
  */
  participants: Array<String>
}