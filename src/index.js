import { Launch } from "@lightningjs/sdk";
import NewMain from "./App.js";

export default function () {
  const stageData = {
    stage: {
      w: window.innerWidth,
      h: window.innerHeight,
      clearColor: 0xff1e1e1e, // Transparent background (optional)
      precision: 1.0, // For high-DPI screens (e.g., 2.0 for Retina)
      fullscreen: false,
    },
  };

  return Launch(NewMain, stageData, ...arguments);
}
