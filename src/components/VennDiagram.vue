<template>
  <div id="venn-container">
    <div id="venn"></div>
    <div id="venntooltip" style="opacity: 0"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import * as d3 from "d3";
import { BaseType } from "d3";
import { mapState } from "vuex";
import { Anime, Seiyuu, VennDiagramData } from "../store";
import { uniqBy } from "lodash";
import { getName, getTitle } from "@/utils/data-utils";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const venn = require("venn.js");
export default Vue.extend({
  name: "VennDiagram",

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

  computed: {
    ...mapState([
      "searchResult",
      "selectedAnime",
      "recentAnime",
      "loadingResult"
    ])
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
              sets: subset.map(e => getTitle(e, "jp")),
              size: inAnime.length * 100,
              seiyuus: inAnime.map(([id, s]) => ({ id, ...s }))
            };
          } else {
            return {
              sets: subset.map(e => getTitle(e, "jp")),
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
              .map(s => getName(s))
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
#venn-container {
  display: flex;
  height: 100%;
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
  font-size: 1em;
}
</style>
