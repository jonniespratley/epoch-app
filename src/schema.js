const { gql } = require('apollo-server-express')


// Construct a schema, using GraphQL's schema language
const typeDefs = gql`

type ExternalUrls { spotify: String }
type ExternalIds { isrc: String }
type Images { height: Int url: String width: Int }

type Album { 
  album_type: String
  href: String
  id: String
  name: String
  release_date: String
  release_date_precision: String
  total_tracks: Int
  type: String
  uri: String
  images: [Images ]
  external_urls: ExternalUrls
  available_markets: [String ]
  artists: [Artists ] }

type Items { 
  disc_number: Int
  duration_ms: Int
  explicit: Boolean
  href: String
  id: String
  is_local: Boolean
  name: String
  popularity: Int
  preview_url: String
  track_number: Int
  type: String
  uri: String
  external_urls: ExternalUrls
  external_ids: ExternalIds
  available_markets: [String ]
  artists: [Artists ]
  album: Album }

type Tracks { href: String
  limit: Int
  next: String
  offset: Int
  previous: String
  total: Int
  items: [Items ] }

type Followers { href: String total: Int }

type Artists { href: String
  limit: Int
  next: String
  offset: Int
  previous: String
  total: Int
  items: [Items ] }

type SearchResults { 
  tracks: Tracks 
  artists: Artists 
}

type User {
  id: ID
  username: String
  email: String
  image: String
}

type Track {
  id: ID
  name: String
  href: String
}

type Epoch {
  id: ID
  user: User
  name: String
  image: String
  published: Boolean
  tracks: Tracks
}

input TrackInput{
  id: ID!
  name: String
  href: String
  image: String
}

input TracksInput {
  items: [TrackInput]
}

input EpochInput {
  id: ID
  #user: User
  name: String!
  image: String
  published: Boolean
  tracks: [TrackInput]
}


type Query {
  hello: String
  getTrack(id: String): Items
  search(q:String): SearchResults
  epochs: [Epoch]
  epoch(id: ID): Epoch
  me: User
}

type Mutation {
  newEpoch(input: EpochInput): Epoch
  updateEpoch(id: ID!, input: EpochInput): Epoch!
  deleteEpoch(id: ID!): Boolean!
}
`;

module.exports = typeDefs;