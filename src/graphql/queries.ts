import gql from "graphql-tag";

export const searchAnimeQuery = gql`
  query searchAnime($anime: String, $page: Int) {
    Page(page: 1, perPage: 10) {
      media(search: $anime, type: ANIME) {
        id
        title {
          native
          english
        }
        bannerImage
        characters(page: $page) {
          pageInfo {
            total
            currentPage
            lastPage
          }
        }
      }
    }
  }
`;

export const searchSeiyuuQuery = gql`
  query searchSeiyuuQuery($name: String, $page: Int) {
    Page(page: $page, perPage: 10) {
      staff(search: $name) {
        id
        name {
          first
          last
          full
          native
        }
        image {
          large
          medium
        }
        characters(page: $page) {
          pageInfo {
            total
            currentPage
            lastPage
          }
        }
      }
    }
  }
`;

export const getAnimeInfoQuery = gql`
  query getAnimeInfoQuery($id: Int) {
    Media(id: $id) {
      id
      title {
        native
        english
      }
      bannerImage
      characters {
        pageInfo {
          total
          currentPage
          lastPage
        }
      }
    }
  }
`;

export const getCharactersQuery = gql`
  query getCharactersQuery($id: Int, $page: Int) {
    Media(id: $id) {
      id
      characters(page: $page) {
        edges {
          node {
            id
            name {
              first
              last
              native
            }
            image {
              large
              medium
            }
          }
          role
          voiceActors(language: JAPANESE) {
            id
            name {
              first
              last
              native
            }
            image {
              large
              medium
            }
          }
        }
      }
    }
  }
`;

export const getSeiyuuQuery = gql`
  query getSeiyuuQuery($id: Int, $page: Int) {
    Staff(id: $id) {
      id
      characters(page: $page) {
        edges {
          node {
            id
            name {
              first
              last
              full
              native
            }
            image {
              large
              medium
            }
            media(type: ANIME) {
              nodes {
                id
                title {
                  romaji
                  english
                  native
                  userPreferred
                }
                bannerImage
              }
            }
          }
          role
        }
        pageInfo {
          total
          lastPage
        }
      }
    }
  }
`;

export const getSeiyuuInfoQuery = gql`
  query getSeiyuuInfoQuery($id: Int) {
    Staff(id: $id) {
      id
      name {
        first
        last
        full
        native
      }
      image {
        large
        medium
      }
      characters {
        pageInfo {
          total
          lastPage
        }
      }
    }
  }
`;
