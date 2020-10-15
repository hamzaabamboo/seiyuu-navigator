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

      <v-tabs v-if="!mini" v-model="searchMode" grow>
        <v-tab>Anime</v-tab>
        <v-tab>Seiyuu</v-tab>
      </v-tabs>

      <v-tabs-items v-model="searchMode">
        <v-tab-item><SearchAnime :mini="mini"/></v-tab-item>
        <v-tab-item><SearchSeiyuu :mini="mini"/></v-tab-item>
      </v-tabs-items>
    </v-navigation-drawer>
    <!-- Sizes your content based upon application components -->
    <v-main>
      <!-- Provides the application the proper gutter -->

      <!-- If using vue-router -->
      <!-- <router-view></router-view> -->
      <v-container
        class="popup"
        fluid
        v-if="selectedAnime.length < 1 && selectedSeiyuu.length < 1"
      >
        <h2 class="text-center">Welcome to Seiyuu Navigator !!</h2>
        <h4 class="text-center">Please select an Anime on the left</h4>
      </v-container>
      <div
        class="main"
        fluid
        v-bind:class="{
          hidden: selectedAnime.length < 1 && selectedSeiyuu.length < 1
        }"
      >
        <v-tabs-items v-model="searchMode">
          <v-tab-item :value="0">
            <v-tabs v-model="animeMode" grow>
              <v-tab :disabled="searchMode === 1" :value="0"
                >Venn Diagram</v-tab
              >
              <v-tab :value="1">Table</v-tab>
              <!-- <v-tab>Item Three</v-tab> -->
            </v-tabs>
            <v-tabs-items v-model="animeMode">
              <v-tab-item :value="0" eager>
                <div class="tab-content">
                  <VennDiagram />
                </div>
              </v-tab-item>
              <v-tab-item :value="1" eager>
                <div class="tab-content">
                  <TableView />
                </div>
              </v-tab-item>
            </v-tabs-items>
          </v-tab-item>
          <v-tab-item>
            <v-tabs v-model="seiyuuMode" grow>
              <v-tab :value="1">Table</v-tab>
              <!-- <v-tab>Item Three</v-tab> -->
            </v-tabs>
            <v-tabs-items v-model="seiyuuMode">
              <v-tab-item eager>
                <div class="tab-content">
                  <SeiyuuTable />
                </div>
              </v-tab-item>
            </v-tabs-items>
          </v-tab-item>
        </v-tabs-items>

        <!-- <v-tab-items v-model="searchMode">
          <v-tab-item>
            
          </v-tab-item>
        </v-tab-items> -->
      </div>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import VennDiagram from "./components/VennDiagram.vue";
import TableView from "./components/TableView.vue";
import SearchAnime from "./components/SearchAnime.vue";
import SearchSeiyuu from "./components/SearchSeiyuu.vue";
import SeiyuuTable from "./components/SeiyuuTable.vue";
import { mapState } from "vuex";
import { isEqual } from "lodash";
import { Anime, Seiyuu } from "./store";
import { getAnimeFromId, getSeiyuuFromId } from "./graphql/fetch";
// eslint-disable-next-line @typescript-eslint/no-var-requires
export default Vue.extend({
  name: "App",

  components: {
    VennDiagram,
    TableView,
    SearchAnime,
    SearchSeiyuu,
    SeiyuuTable
  },

  data: () => ({
    searchMode: 0,
    animeMode: 0,
    seiyuuMode: 0,
    mini: false
  }),

  mounted: function() {
    const { animes, seiyuus } = this.$route.query;
    if (animes || seiyuus) {
      this.$store.dispatch("preload", {
        animes: animes
          ? (animes as string).split(",").filter(i => i)
          : undefined,
        seiyuus: seiyuus
          ? (seiyuus as string).split(",").filter(i => i)
          : undefined,
        apollo: this.$apollo
      });
    }
    this.$store.dispatch("searchAnime", {
      anime: "Revue Starlight",
      apollo: this.$apollo
    });
    this.$store.dispatch("searchSeiyuu", {
      seiyuu: "Momoyo",
      apollo: this.$apollo
    });
  },
  computed: {
    ...mapState(["selectedAnime", "selectedSeiyuu", "loadingResult"])
  },
  methods: {
    updateQuery() {
      const newQuery = {
        seiyuus:
          this.selectedSeiyuu.length > 0
            ? (this.selectedSeiyuu as Seiyuu[]).map(s => s.id).join(",")
            : undefined,
        animes:
          this.selectedAnime.length > 0
            ? (this.selectedAnime as Anime[]).map(s => s.id).join(",")
            : undefined
      };
      if (
        newQuery.seiyuus != this.$route.query.seiyuus ||
        newQuery.animes != this.$route.query.animes
      ) {
        console.log(newQuery, this.$route.query);
        this.$router.push({
          path: this.$route.path,
          query: newQuery
        });
      }
    }
  },
  watch: {
    selectedSeiyuu() {
      this.updateQuery();
    },
    selectedAnime() {
      this.updateQuery();
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

.tab-content {
  width: 100%;
  height: calc(100vh - 48px);
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
