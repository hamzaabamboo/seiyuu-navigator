import Vue from "vue";
import Vuex from "vuex";
import { ApolloClientMethods } from "vue-apollo/types/vue-apollo";
import {
  getAnimeFromId,
  getAnimeFromSearch,
  getSeiyuuFromId,
  getSeiyuuFromSearch,
  searchAnime,
  searchSeiyuu
} from "@/graphql/fetch";

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
    setSelected(state, payload: { anime: Anime[]; seiyuu: Seiyuu[] }) {
      state.selectedAnime = payload.anime;
      state.selectedSeiyuu = payload.seiyuu;
    },
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
      const result = await searchAnime(anime, apollo);
      commit("setLoadingResult", false);
      commit("setSearchResult", result);
    },
    async searchSeiyuu({ commit }, { seiyuu, apollo }) {
      commit("setLoadingResult", true);
      const result = await searchSeiyuu(seiyuu, apollo);
      commit("setLoadingResult", false);
      commit("setSeiyuuResult", result);
    },
    async selectAnime(
      { commit, state },
      { anime, apollo }: { anime: AnimePreview; apollo: ApolloClientMethods }
    ) {
      if (state.selectedAnime.find(a => a.id === anime.id)) {
        console.log("not found la");
        commit("toggleSelectAnime", anime);
      } else {
        commit("setLoadingResult", true);
        const res = await getAnimeFromSearch(anime, apollo);
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
        commit("setLoadingResult", true);
        const res = await getSeiyuuFromSearch(seiyuu, apollo);
        commit("setLoadingResult", false);
        commit("toggleSelectSeiyuu", res);
      }
    },
    async preload(
      { commit },
      {
        animes,
        seiyuus,
        apollo
      }: { animes?: string[]; seiyuus?: string[]; apollo: ApolloClientMethods }
    ) {
      commit("setLoadingResult", true);
      const animeRes = await Promise.all(
        animes?.map(id => getAnimeFromId(id, apollo)) ?? []
      );
      const seiyuuRes = await Promise.all(
        seiyuus?.map(id => getSeiyuuFromId(id, apollo)) ?? []
      );
      commit("setLoadingResult", false);
      commit("setSelected", { anime: animeRes, seiyuu: seiyuuRes });
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
