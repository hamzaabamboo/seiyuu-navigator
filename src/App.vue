<template>
  <v-app>
    <v-navigation-drawer width="400" app permanent :mini-variant.sync="mini">
      <v-list-item>
        <v-list-item-title v-if="!mini" class="title">Seiyuu Navigator</v-list-item-title>
        <v-list-item-title v-else class="title">声</v-list-item-title>
        <v-list-item-subtitle class="title">声優ナビゲター</v-list-item-subtitle>
        <v-btn icon @click.stop="mini = !mini">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
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
            <v-list-item-title v-html="item.title.english || item.title.native"></v-list-item-title>
            <v-list-item-subtitle v-html="item.title.english ? item.title.native : ''"></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
      <v-list-item-group color="primary">
        <v-list-item v-if="selectedAnime.length > 0 && !mini">
          <v-list-item-content>
            <v-list-item-title class="title">Selected Animes</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
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
            <v-list-item-title v-html="item.title.english || item.title.native"></v-list-item-title>
            <v-list-item-subtitle v-html="item.title.english ? item.title.native : ''"></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
      <v-list-item-group color="primary">
        <v-list-item v-if="recentAnime.length > 0 && !mini">
          <v-list-item-content>
            <v-list-item-title class="title">Recent Animes</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-for="item in recentAnime"
          class="px-2"
          :key="item.id"
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
            <v-list-item-title v-html="item.title.english || item.title.native"></v-list-item-title>
            <v-list-item-subtitle v-html="item.title.english ? item.title.native : ''"></v-list-item-subtitle>
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
      <div class="main" fluid v-bind:class="{ hidden: selectedAnime.length < 1 }">
        <v-tabs v-model="mode" grow>
          <v-tab>Venn Diagram</v-tab>
          <v-tab>Table</v-tab>
          <!-- <v-tab>Item Three</v-tab> -->
        </v-tabs>
        <v-tabs-items v-model="mode">
          <v-tab-item eager>
            <div class="tab-content">
              <VennDiagram />
            </div>
          </v-tab-item>
          <v-tab-item eager>
            <div class="tab-content">
              <TableView />
            </div>
          </v-tab-item>
          <v-tab-item eager>
            <div class="tab-content">
              <h1>Work in progress</h1>
            </div>
          </v-tab-item>
        </v-tabs-items>
      </div>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import VennDiagram from "./components/VennDiagram.vue";
import TableView from "./components/TableView.vue";
import * as d3 from "d3";
import { BaseType } from "d3";
import { mapState } from "vuex";
import { Anime, Seiyuu, Character } from "./store";
import { uniqBy } from "lodash";
import { getName, getTitle, getImage } from "@/utils/data-utils";
// eslint-disable-next-line @typescript-eslint/no-var-requires
export default Vue.extend({
  name: "App",

  components: {
    VennDiagram,
    TableView
  },

  data: () => ({
    mode: 0,
    mini: false
  }),

  mounted: function() {
    this.$store.dispatch("searchAnime", {
      anime: "Revue Starlight",
      apollo: this.$apollo
    });
  },
  computed: {
    ...mapState([
      "searchResult",
      "selectedAnime",
      "recentAnime",
      "loadingResult"
    ])
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
