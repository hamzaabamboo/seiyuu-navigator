import * as _d3 from "d3";

declare global {
  const d3: typeof _d3;
}

declare module "venn.js" {
  const lib: any;
  export default lib;
}
