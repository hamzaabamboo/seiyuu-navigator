module.exports = {
  publicPath:
    process.env.NODE_ENV === "production" ? "/seiyuu-navigator/" : "/",
  transpileDependencies: ["vuetify"]
};
