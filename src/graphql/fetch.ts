import {
  Anime,
  AnimePreview,
  Character,
  PageInfo,
  Seiyuu,
  SeiyuuPreview
} from "@/store";
import { getName, getTitle } from "@/utils/data-utils";
import { ApolloClientMethods } from "vue-apollo/types/vue-apollo";
import {
  getAnimeInfoQuery,
  getCharactersQuery,
  getSeiyuuInfoQuery,
  getSeiyuuQuery,
  searchAnimeQuery,
  searchSeiyuuQuery
} from "./queries";

export const searchAnime = async (
  query: string,
  apollo: ApolloClientMethods
) => {
  const { data } = await apollo.query({
    query: searchAnimeQuery,
    variables: {
      anime: query,
      page: 1
    }
  });
  return (data["Page"]["media"] as any[])
    .map<AnimePreview>((anime: any) => {
      return {
        id: anime.id,
        title: anime.title,
        image: anime.bannerImage,
        pageInfo: anime.characters.pageInfo
      };
    })
    .filter(e => getTitle(e));
};

export const getAnimeFromSearch = async (
  anime: AnimePreview,
  apollo: ApolloClientMethods
): Promise<Anime> => {
  const promises = Array(anime.pageInfo.lastPage)
    .fill(null)
    .map((_, page) =>
      apollo.query({
        query: getCharactersQuery,
        variables: {
          id: anime.id,
          page: page + 1
        }
      })
    );
  console.log("Total Pages : ", anime.pageInfo.lastPage);
  const data = (await Promise.all(promises))
    .map(e => e.data["Media"])
    .flatMap(e => e.characters.edges);
  return {
    id: anime.id,
    title: anime.title,
    image: anime.image,
    characters: data.map<Character>((character: any) => {
      return {
        id: character.node.id,
        name: character.node.name,
        image: character.node.image,
        role: character.role,
        voiceActor: character.voiceActors[0]
          ? {
              id: character.voiceActors[0].id,
              name: character.voiceActors[0].name,
              image: character.voiceActors[0].image
            }
          : undefined
      };
    }),
    pageInfo: anime.pageInfo
  };
};

export const searchSeiyuu = async (
  query: string,
  apollo: ApolloClientMethods
) => {
  const { data } = await (apollo as ApolloClientMethods).query({
    query: searchSeiyuuQuery,
    variables: {
      name: query
    }
  });
  return (data["Page"]["staff"] as any[])
    .map<Seiyuu>((seiyuu: any) => {
      return {
        id: seiyuu.id,
        name: seiyuu.name,
        image: seiyuu.image,
        pageInfo: seiyuu.characters.pageInfo
      };
    })
    .filter(e => getName(e));
};

export const getSeiyuuFromSearch = async (
  seiyuu: SeiyuuPreview,
  apollo: ApolloClientMethods
): Promise<Seiyuu> => {
  const promises = Array(seiyuu.pageInfo.lastPage)
    .fill(null)
    .map((_, page) =>
      apollo.query({
        query: getSeiyuuQuery,
        variables: {
          id: seiyuu.id,
          page: page + 1
        }
      })
    );
  console.log("Total Pages : ", seiyuu.pageInfo.lastPage);
  const data = (await Promise.all(promises)).flatMap(
    e => e.data["Staff"]["characters"].edges
  );
  console.log(data);
  return {
    id: seiyuu.id,
    name: seiyuu.name,
    image: seiyuu.image,
    anime: data.flatMap(({ node, role }: any) => {
      const character = {
        id: node.id,
        name: node.name,
        image: node.image,
        role: role
      };
      return node.media.nodes.map((m: any) => ({
        id: m.id,
        title: m.title,
        image: m.bannerImage,
        character: [character]
      }));
    })
  };
};

export const getSeiyuuFromId = async (
  seiyuu: string,
  apollo: ApolloClientMethods
): Promise<Seiyuu> => {
  const { data } = await apollo.query({
    query: getSeiyuuInfoQuery,
    variables: {
      id: seiyuu
    }
  });
  const pageInfo: PageInfo = data["Staff"]["characters"].pageInfo;
  const promises = Array(pageInfo.lastPage)
    .fill(null)
    .map((_, page) =>
      apollo.query({
        query: getSeiyuuQuery,
        variables: {
          id: seiyuu,
          page: page + 1
        }
      })
    );
  console.log("Total Pages : ", pageInfo.lastPage);
  const characters = (await Promise.all(promises)).flatMap(
    e => e.data["Staff"]["characters"].edges
  );
  console.log(characters);
  return {
    id: data["Staff"].id,
    name: data["Staff"].name,
    image: data["Staff"].image,
    anime: characters.flatMap(({ node, role }: any) => {
      const character = {
        id: node.id,
        name: node.name,
        image: node.image,
        role: role
      };
      return node.media.nodes.map((m: any) => ({
        id: m.id,
        title: m.title,
        image: m.bannerImage,
        character: [character]
      }));
    })
  };
};

export const getAnimeFromId = async (
  anime: string,
  apollo: ApolloClientMethods
): Promise<Anime> => {
  const { data } = await apollo.query({
    query: getAnimeInfoQuery,
    variables: {
      id: anime
    }
  });
  const pageInfo: PageInfo = data["Media"]["characters"].pageInfo;
  const promises = Array(pageInfo.lastPage)
    .fill(null)
    .map((_, page) => {
      console.log(page);
      return apollo.query({
        query: getCharactersQuery,
        variables: {
          id: anime,
          page: page + 1
        }
      });
    });
  console.log("Total Pages : ", pageInfo.lastPage);
  const characters = (await Promise.all(promises))
    .map(e => e.data["Media"])
    .flatMap(e => e.characters.edges);
  return {
    id: data["Media"].id,
    title: data["Media"].title,
    image: data["Media"].image,
    characters: characters.map<Character>((character: any) => {
      return {
        id: character.node.id,
        name: character.node.name,
        image: character.node.image,
        role: character.role,
        voiceActor: character.voiceActors[0]
          ? {
              id: character.voiceActors[0].id,
              name: character.voiceActors[0].name,
              image: character.voiceActors[0].image
            }
          : undefined
      };
    })
  };
};
