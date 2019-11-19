module.exports = `
# Write your query or mutation here

query getTrack{
  getTrack(id: "3XiNC94b4Tq1xwv70sQJGN"){
    name
    href
    total_tracks
    artists{
      total
    }
  }
}
query search {
  search(q: "uzi vert") {
    tracks {
      items {
        id
        name
      }
    }
  }
}
query getEpochs {
  epochs {
    id
    name
    image
    tracks {
      total
      items {
        id
        name
      }
    }
  }
}
mutation newEpoch {
  newEpoch(
    input: {
     
      name: "09-01-2019 Playlist"
      image: "https://i.scdn.co/image/ab67616d0000b27334bf16d92ae11f8d3eadf295"
      tracks: [
        { id: "3XiNC94b4Tq1xwv70sQJGN" }
        { id: "2BJSMvOGABRxokHKB0OI8i" }
      ]
    }
  ) {
    id
    name
    image
    tracks{
      items{
        id
      }
    }
    
  }
}

`