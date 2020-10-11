<template>
  <div>
    <v-list-item>
      <v-list-item-content>
        <v-text-field
          @change="
            $store.dispatch('searchAnime', {
              anime: $event,
              apollo: $apollo
            })
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
          <v-list-item-title
            v-html="item.title.english || item.title.native"
          ></v-list-item-title>
          <v-list-item-subtitle
            v-html="item.title.english ? item.title.native : ''"
          ></v-list-item-subtitle>
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
          <v-list-item-title
            v-html="item.title.english || item.title.native"
          ></v-list-item-title>
          <v-list-item-subtitle
            v-html="item.title.english ? item.title.native : ''"
          ></v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list-item-group>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";

export default Vue.extend({
  name: "SearchAnime",

  props: ["mini"],
  data: () => ({
    menuData: undefined as any
  }),

  methods: {},
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
</style>
