<template>
  <div class="scrollable" style="overflow-x: auto">
    <v-data-table
      :headers="tableHeader"
      :items="tableItems"
      sort-by="animes"
      sort-desc
      :items-per-page="50"
      fixed-header
      calculate-widths
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
      <template v-for="seiyuu in seiyuuList" v-slot:[seiyuu]="{ value }">
        <!-- {{JSON.stringify(value)}} -->
        <div :key="seiyuu">
          <v-avatar color="indigo" size="36" v-if="value && value.image">
            <v-img :src="value.image" :alt="value.name" />
          </v-avatar>
          <span v-if="value && value.name" style="padding-left: 4px">{{
            value.name
          }}</span>
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
          @click="
            $store.dispatch('addAnime', {
              anime: menuData.item.anime.id,
              apollo: $apollo
            })
          "
          disabled
        >
          <v-list-item-title v-if="menuData.item.anime.name"
            >Add {{ menuData.item.anime.name }} to list</v-list-item-title
          >
        </v-list-item>
        <v-list-item
          v-for="key in Object.keys(menuData.item).filter(
            k => menuData.item[k] && menuData.item[k].name && k !== 'animes'
          )"
          :key="key"
          @click="searchGoogle(menuData.item[key].name)"
        >
          <v-list-item-title v-if="menuData.item[key].name"
            >Search for {{ menuData.item[key].name }}</v-list-item-title
          >
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

interface TableData {
  name: Seiyuu["name"];
  character: Character;
  role: string;
}
export default Vue.extend({
  name: "SeiyuuTable",

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
      "selectedSeiyuu",
      "recentAnime",
      "loadingResult"
    ]),
    seiyuuList() {
      return [
        "item.anime",
        ...(this.selectedSeiyuu as Seiyuu[]).map(s => "item." + getName(s))
      ];
    },
    tableHeader() {
      return [
        {
          text: "Anime",
          value: "anime",
          width: 250
        },
        {
          text: "Animes",
          value: "animes",
          divider: true,
          width: 50,
          align: "center"
        },
        ...(this.selectedSeiyuu as Seiyuu[]).map(s => ({
          text: getName(s),
          value: getName(s),
          width: 250
        }))
      ];
    },
    tableItems() {
      const animes: Seiyuu["anime"] = uniqBy(
        (this.selectedSeiyuu as Seiyuu[]).reduce(
          (acc, seiyuu) => [
            ...new Set([
              ...(seiyuu.anime ?? [])
                .map(e => JSON.parse(JSON.stringify(e ?? "")))
                .filter(e => e !== undefined),
              ...(acc ?? [])
            ])
          ],
          [] as Seiyuu["anime"]
        ),
        e => getTitle(e)
      );
      const rows = animes.map(({ id, ...rest }) => {
        const seiyuus: {
          name: Seiyuu["name"];
          character: Character;
        }[] = (this.selectedSeiyuu as Seiyuu[])
          .map(e => {
            const c = e.anime?.find(c => c.id === id);
            return (
              c !== undefined && {
                name: e.name,
                character: c.character[0]
              }
            );
          })
          .filter((e): e is TableData => e !== false);
        return {
          id,
          seiyuus,
          ...rest
        };
      });
      console.log(rows);
      const res = rows.map(r => {
        const res: {
          [key: string]: string | { name: string; image?: string; id?: string };
        } = {
          anime: {
            name: getTitle(r),
            image: r.image ?? "",
            id: r.id
          },
          animes: String(r.seiyuus.length)
        };
        r.seiyuus.forEach(a => {
          res[getName(a)] = {
            name: getName(a.character),
            image: getImage(a.character)
          };
        });
        return res;
      });
      console.log(res);
      return res;
    }
  }
});
</script>

<style lang="scss">
</style>
