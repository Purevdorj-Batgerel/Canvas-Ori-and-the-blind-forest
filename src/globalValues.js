import createValue from "./createValue.js";
import InputManager from "./Inputs.js";

import { calcDimensionRatio } from "./utils.js";

export { audioManager } from "./audioManagerInstance.js";
export { fadeStartTime, setFadeStartTime } from "./fadeState.js";

export const [dimensionRatio, setDimensionRatio] = createValue(
  calcDimensionRatio(),
  calcDimensionRatio,
);

export const inputManager = new InputManager();
