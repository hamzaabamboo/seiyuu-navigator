<template>
  <div>
    <v-list-item>
      <v-list-item-content>
        <v-text-field
          @change="
            $store.dispatch('searchSeiyuu', {
              seiyuu: $event,
              apollo: $apollo
            })
          "
          label="Search Seiyuu"
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
        v-for="item in searchSeiyuuResult"
        :key="item.id"
        class="px-2"
        @click="
          $store.dispatch('selectSeiyuu', { seiyuu: item, apollo: $apollo })
        "
      >
        <v-list-item-avatar
          v-if="getImage(item)"
          :rounded="mini ? undefined : false"
          :size="mini ? 40 : 50"
          :tile="!mini"
        >
          <v-img :src="getImage(item)"></v-img>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title v-html="getName(item)"></v-list-item-title>
          <v-list-item-subtitle v-html="getName(item)"></v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list-item-group>
    <v-list-item-group color="primary">
      <v-list-item v-if="selectedSeiyuu.length > 0 && !mini">
        <v-list-item-content>
          <v-list-item-title class="title">Selected Seiyuus</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item
        v-for="item in selectedSeiyuu"
        class="px-2"
        :key="item.id"
        @click="$store.dispatch('selectSeiyuu', { seiyuu: item })"
      >
        <v-list-item-avatar
          v-if="getImage(item)"
          :rounded="mini ? undefined : false"
          :size="mini ? 40 : 50"
          :tile="!mini"
        >
          <v-img :src="getImage(item)"></v-img>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title v-html="getName(item)"></v-list-item-title>
          <v-list-item-subtitle v-html="getName(item)"></v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list-item-group>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";
import { getImage, getName } from "@/utils/data-utils";
import { Seiyuu } from "@/store";

export default Vue.extend({
  name: "SearchSeiyuu",

  props: ["mini"],

  data: () => ({
    menuData: undefined as any
  }),

  methods: {
    getName(seiyuu: Seiyuu) {
      return getName(seiyuu);
    },
    getImage(seiyuu: Seiyuu) {
      return getImage(seiyuu);
    }
  },

  computed: {
    ...mapState([
      "searchSeiyuuResult",
      "selectedSeiyuu",
      "recentAnime",
      "loadingResult"
    ])
  }
});
</script>

<style lang="scss">
</style>
