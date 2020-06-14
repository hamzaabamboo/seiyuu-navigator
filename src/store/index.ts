import Vue from "vue";
import Vuex from "vuex";
import { ApolloClientMethods } from "vue-apollo/types/vue-apollo";
import gql from "graphql-tag";
import { searchAnimeQuery, getCharactersQuery } from "@/graphql/queries";

Vue.use(Vuex);

export default new Vuex.Store<Store>({
  state: {
    selectedAnime: [],
    searchResult: [],
    loadingResult: false
  },
  mutations: {
    setLoadingResult(state, payload: boolean) {
      state.loadingResult = payload;
    },
    setSearchResult(state, payload: Anime[]) {
      state.searchResult = [...payload];
    },

    toggleSelectAnime(state, anime: Anime) {
      if (state.selectedAnime.find(a => a.id === anime.id)) {
        state.selectedAnime = state.selectedAnime.filter(
          a => a.id !== anime.id
        );
      } else {
        state.selectedAnime = [...state.selectedAnime, anime];
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
      const result: AnimePreview[] = (data["Page"]["media"] as any[]).map<
        AnimePreview
      >((anime: any) => {
        return {
          id: anime.id,
          title: anime.title,
          image: anime.bannerImage,
          pageInfo: anime.characters.pageInfo
        };
      });
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
          })
        };
        console.log(res);
        commit("setLoadingResult", false);
        commit("toggleSelectAnime", res);
      }
    }
  },
  modules: {}
});

export interface Store {
  selectedAnime: Anime[];
  searchResult: Anime[];
  loadingResult: boolean;
}

export interface Name {
  first: string;
  last: string;
  native: string;
}

export type AnimePreview = Pick<Anime, "id" | "title" | "image"> & {
  pageInfo: {
    total: number;
    currentPage: number;
    lastPage: number;
  };
};
export interface Anime {
  id: string;
  title: {
    native: string;
    english: string;
  };
  image: string;
  characters: Character[];
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
