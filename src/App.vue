<template>
  <v-app>
    <v-navigation-drawer width="400" app permanent :mini-variant.sync="mini">
      <v-list-item>
        <v-list-item-title v-if="!mini" class="title"
          >Seiyuu Navigator</v-list-item-title
        >
        <v-list-item-title v-else class="title">声</v-list-item-title>
        <v-list-item-subtitle class="title"
          >声優ナビゲター</v-list-item-subtitle
        >
        <v-btn icon @click.stop="mini = !mini">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </v-list-item>

      <v-divider></v-divider>

      <v-list-item>
        <v-list-item-content
          ><v-text-field
            @change="
              $store.dispatch('searchAnime', { anime: $event, apollo: $apollo })
            "
            label="Search Anime"
            solo
            v-if="!mini"
            :loading="loadingResult"
            clearable
          ></v-text-field>

          <v-btn v-else icon @click.stop="mini = !mini">
            <v-icon>mdi-magnify</v-icon>
          </v-btn>
        </v-list-item-content>
      </v-list-item>

      <v-list-item-group color="primary">
        <v-list-item
          v-for="item in searchResult"
          :key="item.id"
          class="px-2"
          @click="
            $store.dispatch('selectAnime', { anime: item, apollo: $apollo })
          "
        >
          <v-list-item-avatar
            v-if="item.image"
            :rounded="mini ? undefined : false"
            :size="mini ? 40 : 50"
            :tile="!mini"
          >
            <v-img :src="item.image"></v-img>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title
              v-html="item.title.english || item.title.native"
            ></v-list-item-title>
            <v-list-item-subtitle
              v-html="item.title.english ? item.title.native : ''"
            ></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
      <v-list-item v-if="selectedAnime.length > 0 && !mini">
        <v-list-item-content>
          <v-list-item-title class="title">Selected Animes</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item-group color="primary">
        <v-list-item
          v-for="item in selectedAnime"
          class="px-2"
          :key="item.id"
          @click="$store.dispatch('selectAnime', { anime: item })"
        >
          <v-list-item-avatar
            v-if="item.image"
            :rounded="mini ? undefined : false"
            :size="mini ? 40 : 50"
            :tile="!mini"
          >
            <v-img :src="item.image"></v-img>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title
              v-html="item.title.english || item.title.native"
            ></v-list-item-title>
            <v-list-item-subtitle
              v-html="item.title.english ? item.title.native : ''"
            ></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-navigation-drawer>
    <!-- Sizes your content based upon application components -->
    <v-main>
      <!-- Provides the application the proper gutter -->

      <!-- If using vue-router -->
      <!-- <router-view></router-view> -->
      <v-container class="popup" fluid v-if="selectedAnime.length < 1">
        <h2 class="text-center">Welcome to Seiyuu Navigator !!</h2>
        <h4 class="text-center">Please select an Anime on the left</h4>
      </v-container>
      <div
        class="main"
        fluid
        v-bind:class="{ hidden: selectedAnime.length < 1 }"
      >
        <v-tabs v-model="mode" grow>
          <v-tab>Venn Diagram</v-tab>
          <v-tab>Table</v-tab>
          <!-- <v-tab>Item Three</v-tab> -->
        </v-tabs>
        <v-tabs-items v-model="mode">
          <v-tab-item eager>
            <div class="tab-content">
              <div id="venn"></div>
              <div id="venntooltip" style="opacity: 0"></div>
            </div>
          </v-tab-item>
          <v-tab-item eager>
            <div class="tab-content">
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
                  <template
                    v-for="anime in animesList"
                    v-slot:[anime]="{ value }"
                  >
                    <!-- {{JSON.stringify(value)}} -->
                    <div :key="anime">
                      <v-avatar
                        color="indigo"
                        size="36"
                        v-if="value && value.image"
                      >
                        <img
                          :src="value.image"
                          :alt="value.name"
                          style="height: auto"
                        />
                      </v-avatar>
                      <span
                        v-if="value && value.name"
                        style="padding-left: 4px"
                        >{{ value.name }}</span
                      >
                    </div>
                  </template>
                </v-data-table>
              </div>
            </div>
          </v-tab-item>
          <v-tab-item eager>
            <div class="tab-content">
              <h1>Work in progress</h1>
            </div>
          </v-tab-item>
        </v-tabs-items>
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
              <v-list-item-title v-if="menuData.item[key].name"
                >Search for {{ menuData.item[key].name }}</v-list-item-title
              >
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import ApolloExample from "./components/ApolloExample.vue";
import * as d3 from "d3";
import { BaseType } from "d3";
import { mapState } from "vuex";
import { Anime, Seiyuu, VennDiagramData, Character } from "./store";
import { uniqBy } from "lodash";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const venn = require("venn.js");
export default Vue.extend({
  name: "App",

  components: {
    // ApolloExample
  },

  data: () => ({
    chart: venn.VennDiagram(),
    mode: 0,
    mini: false,
    search: "",
    showMenu: false as any,
    menuData: undefined as any
  }),

  beforeDestroy: () => {
    d3.selectAll("#venn")
      .selectAll("g")
      .on("mouseover", null)
      .on("mousemove", null)
      .on("mouseout", null);
  },

  mounted: function() {
    this.$store.dispatch("searchAnime", {
      anime: "Revue Starlight",
      apollo: this.$apollo
    });
  },
  methods: {
    fuzzySearch(value: any, search: string, item: any) {
      if (!value?.name) return false;
      if (value.name.toLowerCase().includes(search?.toLowerCase() ?? "")) {
        console.log(value, search, item);
      }
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
    ...mapState(["searchResult", "selectedAnime", "loadingResult"]),
    animesList() {
      return [
        "item.va",
        ...(this.selectedAnime as Anime[]).map(
          s => "item." + (s.title.english || s.title.native)
        )
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
          text: s.title.english || s.title.native,
          value: s.title.english || s.title.native,
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
          animes,
          ...rest
        };
      });
      const res = rows.map(r => {
        const res: {
          [key: string]: string | { name: string; image?: string };
        } = {
          va: {
            name: `${r.name?.first} ${r.name?.last ?? ""}`,
            image: r.image.large || r.image.medium || undefined
          },
          animes: String(r.animes.length)
        };
        r.animes.forEach(a => {
          res[a.title.english || a.title.native] = {
            name: `${a.character.name.first ?? ""} ${a.character.name.last ??
              ""}`,
            image:
              a.character.image.large || a.character.image.medium || undefined
          };
        });
        return res;
      });
      return res;
    }
  },
  watch: {
    selectedAnime: function(val: Anime[]) {
      const seiyuus = Object.fromEntries(
        val
          .reduce(
            (acc, anime) => [
              ...new Set([
                ...anime.characters
                  .map(e => e.voiceActor as Seiyuu)
                  .filter(e => e !== undefined),
                ...acc
              ])
            ],
            [] as Seiyuu[]
          )
          .map(({ id, ...rest }) => [id, rest])
      );
      const anime = val
        // .map(anime => anime.id)
        .reduce(
          (subsets, value) =>
            subsets.concat(subsets.map(set => [value, ...set])),
          [[]] as Anime[][]
        )
        .map(subset => {
          const notInSubset = [
            ...new Set(
              [...val].filter(v => !new Set(subset.map(s => s.id)).has(v.id))
            )
          ];
          const inAnime = Object.entries(seiyuus).filter(([id]) =>
            subset.every(anime =>
              anime.characters.find(
                c => c.voiceActor && c.voiceActor.id.toString() === id
              )
            )
          );
          const inSubset = inAnime
            .filter(([id]) =>
              notInSubset.every(
                anime =>
                  !anime.characters.find(
                    c => c.voiceActor && c.voiceActor.id.toString() === id
                  )
              )
            )
            .map(([id, s]) => ({ id, ...s }));
          if (subset.length === 1) {
            return {
              sets: subset.map(e => e.title.native || e.title.english),
              size: inAnime.length * 100,
              seiyuus: inAnime.map(([id, s]) => ({ id, ...s }))
            };
          } else {
            return {
              sets: subset.map(e => e.title.native || e.title.english),
              size: inSubset.length * 100,
              seiyuus: inSubset
            };
          }
        });

      const sets: VennDiagramData[] = [...anime]
        .slice(1)
        .sort((a, b) => a.size - b.size)
        .filter(s => s.size > 0);

      const div = d3.select("#venn");
      const tooltip = d3.select("#venntooltip");
      function zoomed() {
        div.attr("transform", d3.event.transform);
      }

      div
        .datum(JSON.parse(JSON.stringify(sets)))
        .call(this.chart)
        .call(
          d3
            .zoom()
            .scaleExtent([1, 8])
            .on("zoom", zoomed) as any
        );
      div
        .selectAll("g")
        .on("mouseover", null)
        .on("mousemove", null)
        .on("mouseout", null);

      div
        .selectAll<BaseType, VennDiagramData>("g")
        .on("mouseover", function<VennDiagramData>(
          this: BaseType,
          d: {
            sets: string[];
            size: number;
            seiyuus: Seiyuu[];
          }
        ) {
          // sort all the areas relative to the current item
          venn.sortAreas(div, d);

          // Display a tooltip with the current size
          tooltip
            .transition()
            .duration(400)
            .style("opacity", 0.9);
          tooltip.text(
            d.seiyuus
              .filter(s => !!s.name)
              .map(s =>
                s.name.first ? `${s.name.first} ${s.name.last}` : s.name.native
              )
              .join(", \n")
          );

          // highlight the current path
          const selection = d3
            .select(this)
            .transition("tooltip")
            .duration(400);
          selection
            .select("path")
            .style("stroke-width", 3)
            .style("stroke", "white")
            .style("fill-opacity", d.sets.length == 1 ? 0.4 : 0.1)
            .style("stroke-opacity", 1);
        })

        .on("mousemove", function() {
          tooltip
            .style("left", d3.event.clientX + "px")
            .style("top", d3.event.clientY - 28 + "px");
        })

        .on("mouseout", function<VennDiagramData>(
          this: BaseType,
          d: {
            sets: string[];
            size: number;
            seiyuus: Seiyuu[];
          }
        ) {
          tooltip
            .transition()
            .duration(400)
            .style("opacity", 0);
          if (this) {
            const selection = d3
              .select(this)
              .transition("tooltip")
              .duration(400);
            selection
              .select("path")
              .style("stroke-width", 0)
              .style("fill-opacity", d.sets.length == 1 ? 0.25 : 0.0)
              .style("stroke-opacity", 0);
          }
        });
    }
  }
});
</script>

<style lang="scss">
.main {
  min-height: 100vh;
  display: flex;
  align-items: stretch;
  justify-content: center;
  flex-direction: column;
  .v-tabs {
    flex-grow: 0;
  }
}
#venn {
  min-height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-content {
  width: 100%;
  height: calc(100vh - 48px);
}
#venntooltip {
  position: fixed;
  background-color: black;
  color: white;
  pointer-events: none;
  font-size: 1em;
}

.popup {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
  flex-direction: column;
}

.hidden {
  display: none;
}
</style>
