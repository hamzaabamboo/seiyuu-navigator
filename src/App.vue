<template>
  <v-app>
    <v-navigation-drawer width="400" app>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="title">Seiyuu Navigator</v-list-item-title>
          <v-list-item-subtitle class="title"
            >声優ナビゲター</v-list-item-subtitle
          >
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list-item>
        <v-list-item-content>
          <v-text-field
            @change="
              $store.dispatch('searchAnime', { anime: $event, apollo: $apollo })
            "
            label="Search Anime"
            solo
            :loading="loadingResult"
            clearable
          ></v-text-field>
        </v-list-item-content>
      </v-list-item>
      <v-list-item-group color="primary">
        <v-list-item
          v-for="item in searchResult"
          :key="item.id"
          @click="
            $store.dispatch('selectAnime', { anime: item, apollo: $apollo })
          "
        >
          <v-list-item-avatar
            v-if="item.image"
            :rounded="false"
            :size="50"
            tile
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
      <v-list-item v-if="selectedAnime.length > 0">
        <v-list-item-content>
          <v-list-item-title class="title">Selected Animes</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item-group color="primary">
        <v-list-item
          v-for="item in selectedAnime"
          :key="item.id"
          @click="$store.dispatch('selectAnime', { anime: item })"
        >
          <v-list-item-avatar
            v-if="item.image"
            :rounded="false"
            :size="50"
            tile
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
      <v-container class="main" fluid>
        <!-- If using vue-router -->
        <!-- <router-view></router-view> -->
        <div id="venn"></div>
        <div id="venntooltip" style="opacity: 0"></div>
      </v-container>
      <v-container class="popup" fluid v-if="selectedAnime.length < 1">
        <h2 class="text-center">Welcome to Seiyuu Navigator !!</h2>
        <h4 class="text-center">Please select an Anime on the left</h4>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import ApolloExample from "./components/ApolloExample.vue";
import * as d3 from "d3";
import { BaseType } from "d3";
import { mapState } from "vuex";
import { Anime, Seiyuu, VennDiagramData } from "./store";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const venn = require("venn.js");
export default Vue.extend({
  name: "App",

  components: {
    // ApolloExample
  },

  data: () => ({
    chart: venn.VennDiagram()
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
  watch: {
    selectedAnime: function(val: Anime[]) {
      console.log(val);
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

      console.log(JSON.parse(JSON.stringify(sets)));
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
  },
  computed: mapState(["searchResult", "selectedAnime", "loadingResult"])
});
</script>

<style lang="scss">
.main {
  min-height: 100vh;
  display: flex;
  align-items: stretch;
  justify-content: center;
  flex-direction: column;
}
#venn {
  min-height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

#venntooltip {
  position: fixed;
  background-color: black;
  color: white;
  pointer-events: none;
  padding: 4px;
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
</style>
