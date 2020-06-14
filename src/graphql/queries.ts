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

export const getCharactersQuery = gql`
  query getCharactersQuery($id: Int, $page: Int) {
    Media(id: $id) {
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
