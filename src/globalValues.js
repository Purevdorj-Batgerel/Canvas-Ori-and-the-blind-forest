import createValue from "./createValue";
import AudioManager from "./AudioManager";
import InputManager from "./Inputs";

import { calcDimensionRatio } from "./utils";

export const [fadeStartTime, setFadeStartTime] = createValue(0);
export const [dimensionRatio, setDimensionRatio] = createValue(
  calcDimensionRatio(),
  calcDimensionRatio,
);

export const audioManager = new AudioManager();

export const inputManager = new InputManager();