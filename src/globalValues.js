import createValue from "./createValue";

import { calcDimensionRatio } from "./utils";

export const [fadeStartTime, setFadeStartTime] = createValue(0);
export const [dimensionRatio, setDimensionRatio] = createValue(
  calcDimensionRatio(),
  calcDimensionRatio,
);
