<template>
  <div class="scrollable" style="overflow-x: auto">
    <v-data-table
      :headers="tableHeader"
      :items="tableItems"
      sort-by="animes"
      sort-desc
      disable-pagination
      fixed-header
      calculate-widths
      hide-default-footer
      :custom-filter="fuzzySearch"
      :loading="loadingResult"
      :search="search"
      @contextmenu:row="setMenu"
    >
      <template v-slot:top>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          class="mx-4"
          hide-details
        ></v-text-field>
      </template>
      <template v-for="anime in animesList" v-slot:[anime]="{ value }">
        <!-- {{JSON.stringify(value)}} -->
        <div :key="anime">
          <v-avatar color="indigo" size="36" v-if="value && value.image">
            <img :src="value.image" :alt="value.name" style="height: auto" />
          </v-avatar>
          <span v-if="value && value.name" style="padding-left: 4px">{{ value.name }}</span>
        </div>
      </template>
    </v-data-table>
    <v-menu
      v-model="showMenu"
      absolute
      offset-y
      :position-x="menuData ? menuData.x : 0"
      :position-y="menuData ? menuData.y : 0"
      style="max-width: 600px"
    >
      <v-list v-if="menuData">
        <v-list-item
          v-for="key in Object.keys(menuData.item).filter(
                k => menuData.item[k] && menuData.item[k].name && k !== 'animes'
              )"
          :key="key"
          @click="searchGoogle(menuData.item[key].name)"
        >
          <v-list-item-title v-if="menuData.item[key].name">Search for {{ menuData.item[key].name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";
import { Anime, Seiyuu, Character } from "../store";
import { uniqBy } from "lodash";
import { getName, getTitle, getImage } from "@/utils/data-utils";

export default Vue.extend({
  name: "TableView",

  data: () => ({
    search: "",
    showMenu: false as any,
    menuData: undefined as any
  }),

  methods: {
    fuzzySearch(value: any, search: string, item: any) {
      if (!value?.name) return false;
      return value.name.toLowerCase().includes(search?.toLowerCase() ?? "");
    },
    setMenu(event: MouseEvent, value: any) {
      this.menuData = false;
      this.$nextTick(() => {
        this.showMenu = true;
        this.menuData = {
          x: event.clientX,
          y: event.clientY,
          item: value.item
        };
      });
      event.preventDefault();
    },
    searchGoogle(what: string) {
      window.open(
        "https://www.google.com/search?q=" + encodeURIComponent(what)
      );
    }
  },
  computed: {
    ...mapState([
      "searchResult",
      "selectedAnime",
      "recentAnime",
      "loadingResult"
    ]),
    animesList() {
      return [
        "item.va",
        ...(this.selectedAnime as Anime[]).map(s => "item." + getTitle(s))
      ];
    },
    tableHeader() {
      return [
        {
          text: "Name",
          value: "va",
          width: 250
        },
        {
          text: "Animes",
          value: "animes",
          divider: true,
          width: 50,
          align: "center"
        },
        ...(this.selectedAnime as Anime[]).map(s => ({
          text: getTitle(s),
          value: getTitle(s),
          width: 250
        }))
      ];
    },
    tableItems() {
      const seiyuus: Seiyuu[] = uniqBy(
        (this.selectedAnime as Anime[])
          .reduce(
            (acc, anime) => [
              ...new Set([
                ...anime.characters
                  .map(e =>
                    JSON.parse(JSON.stringify((e.voiceActor as Seiyuu) ?? ""))
                  )
                  .filter(e => e !== undefined),
                ...acc
              ])
            ],
            [] as Seiyuu[]
          )
          .filter(e => e.name),
        e => e.name.native || e.name.first
      );
      const rows = seiyuus.map(({ id, ...rest }) => {
        const animes: {
          title: Anime["title"];
          character: Character;
        }[] = (this.selectedAnime as Anime[])
          .map(e => {
            const c = e.characters.find(c => c.voiceActor?.id === id);
            return (
              c !== undefined && {
                title: e.title,
                character: c
              }
            );
          })
          .filter(
            (
              e
            ): e is {
              title: Anime["title"];
              character: Character;
              role: string;
            } => e !== false
          );
        return {
          id,
          animes,
          ...rest
        };
      });
      const res = rows.map(r => {
        const res: {
          [key: string]: string | { name: string; image?: string };
        } = {
          va: {
            name: getName(r),
            image: getImage(r)
          },
          animes: String(r.animes.length)
        };
        r.animes.forEach(a => {
          res[getTitle(a)] = {
            name: getName(a.character),
            image: getImage(a.character)
          };
        });
        return res;
      });
      return res;
    }
  }
});
</script>

<style lang="scss">
</style>
