import Vue from "vue";
import Vuex from "vuex";
import { ApolloClientMethods } from "vue-apollo/types/vue-apollo";
import gql from "graphql-tag";
import {
  searchAnimeQuery,
  getCharactersQuery,
  searchSeiyuuQuery,
  getSeiyuuQuery
} from "@/graphql/queries";
import { getName, getTitle } from "@/utils/data-utils";

Vue.use(Vuex);

export default new Vuex.Store<Store>({
  state: {
    selectedAnime: [],
    selectedSeiyuu: [],
    searchResult: [],
    searchSeiyuuResult: [],
    recentAnime: [],
    loadingResult: false
  },
  mutations: {
    setLoadingResult(state, payload: boolean) {
      state.loadingResult = payload;
    },
    setSearchResult(state, payload: Anime[]) {
      state.searchResult = [...payload];
    },

    setSeiyuuResult(state, payload: Seiyuu[]) {
      state.searchSeiyuuResult = [...payload];
    },

    toggleSelectAnime(state, anime: Anime) {
      if (state.selectedAnime.find(a => a.id === anime.id)) {
        state.selectedAnime = state.selectedAnime.filter(
          a => a.id !== anime.id
        );
        if (!state.recentAnime.find(a => a.id === anime.id)) {
          const newArr = [anime, ...state.recentAnime];
          if (newArr.length > 4) {
            newArr.pop();
          }
          state.recentAnime = newArr;
        }
      } else {
        state.selectedAnime = [...state.selectedAnime, anime];
        if (state.recentAnime.find(a => a.id === anime.id)) {
          state.recentAnime = state.recentAnime.filter(a => a.id !== anime.id);
        }
      }
    },
    toggleSelectSeiyuu(state, seiyuu: Seiyuu) {
      if (state.selectedSeiyuu.find(a => a.id === seiyuu.id)) {
        state.selectedSeiyuu = state.selectedSeiyuu.filter(
          a => a.id !== seiyuu.id
        );
      } else {
        state.selectedSeiyuu = [...state.selectedSeiyuu, seiyuu];
      }
    }
  },
  actions: {
    async searchAnime({ commit }, { anime, apollo }) {
      commit("setLoadingResult", true);
      const { data } = await (apollo as ApolloClientMethods).query({
        query: searchAnimeQuery,
        variables: {
          anime,
          page: 1
        }
      });
      const result: AnimePreview[] = (data["Page"]["media"] as any[])
        .map<AnimePreview>((anime: any) => {
          return {
            id: anime.id,
            title: anime.title,
            image: anime.bannerImage,
            pageInfo: anime.characters.pageInfo
          };
        })
        .filter(e => getTitle(e));
      commit("setLoadingResult", false);
      commit("setSearchResult", result);
    },
    async selectAnime(
      { commit, state },
      { anime, apollo }: { anime: AnimePreview; apollo: ApolloClientMethods }
    ) {
      if (state.selectedAnime.find(a => a.id === anime.id)) {
        console.log("not found la");
        commit("toggleSelectAnime", anime);
      } else {
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
        commit("setLoadingResult", true);
        const data = (await Promise.all(promises))
          .map(e => e.data["Media"])
          .flatMap(e => e.characters.edges);
        const res: Anime = {
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
        commit("setLoadingResult", false);
        commit("toggleSelectAnime", res);
      }
    },
    async selectSeiyuu(
      { commit, state },
      { seiyuu, apollo }: { seiyuu: SeiyuuPreview; apollo: ApolloClientMethods }
    ) {
      if (state.selectedSeiyuu.find(a => a.id === seiyuu.id)) {
        console.log("not found la");
        commit("toggleSelectSeiyuu", seiyuu);
      } else {
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
        commit("setLoadingResult", true);
        const data = (await Promise.all(promises)).flatMap(
          e => e.data["Staff"]["characters"].edges
        );
        console.log(data);
        const res: Seiyuu = {
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
        commit("setLoadingResult", false);
        commit("toggleSelectSeiyuu", res);
      }
    },
    async searchSeiyuu({ commit }, { seiyuu, apollo }) {
      commit("setLoadingResult", true);
      const { data } = await (apollo as ApolloClientMethods).query({
        query: searchSeiyuuQuery,
        variables: {
          name: seiyuu
        }
      });
      const result: Seiyuu[] = (data["Page"]["staff"] as any[])
        .map<Seiyuu>((seiyuu: any) => {
          return {
            id: seiyuu.id,
            name: seiyuu.name,
            image: seiyuu.image,
            pageInfo: seiyuu.characters.pageInfo
          };
        })
        .filter(e => getName(e));
      commit("setLoadingResult", false);
      commit("setSeiyuuResult", result);
    }
  },
  modules: {}
});

export interface Store {
  selectedAnime: Anime[];
  searchResult: Anime[];
  recentAnime: Anime[];
  loadingResult: boolean;
  searchSeiyuuResult: Seiyuu[];
  selectedSeiyuu: Seiyuu[];
}

export interface Name {
  first: string;
  last: string;
  native: string;
}

export interface PageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
}

export type AnimePreview = Pick<Anime, "id" | "title" | "image"> & {
  pageInfo: PageInfo;
};
export type SeiyuuPreview = Pick<Seiyuu, "id" | "name" | "image"> & {
  pageInfo: PageInfo;
};

export interface Anime {
  id: string;
  title: {
    native: string;
    english: string;
  };
  image: string;
  characters: Character[];
  pageInfo?: {
    total: number;
    currentPage: number;
    lastPage: number;
  };
}

export interface Character {
  id: string;
  name: Name;
  role: string;
  image: Image;
  voiceActor?: Seiyuu;
}
export interface Seiyuu {
  id: string;
  name: Name;
  image: Image;
  anime?: (Pick<Anime, "id" | "title" | "image"> & {
    character: Character[];
  })[];
}

export interface Image {
  large: string;
  medium: string;
}

export interface VennDiagramData {
  sets: string[];
  size: number;
  seiyuus: Seiyuu[];
}
