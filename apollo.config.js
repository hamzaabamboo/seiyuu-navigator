import path from "path";
// Load .env files
import { loadEnv } from "vue-cli-plugin-apollo/utils/load-env";

const env = loadEnv([
  path.resolve(__dirname, ".env"),
  path.resolve(__dirname, ".env.local"),
]);

module.exports = {
  client: {
    service: {
      name: "AniList DB",
      url: "https://graphql.anilist.co",
    },
    includes: ["src/**/*.{js,jsx,ts,tsx,vue,gql}"],
  },
};
