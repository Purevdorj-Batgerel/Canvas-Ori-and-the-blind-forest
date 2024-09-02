/**
 * Creates a value management function pair.
 *
 * @param {*} value - The initial value.
 * @param {function(): *} [customSetValue] - An optional custom setter function.
 * @returns {[function(): *, function(*)]} A pair of functions: `getValue` and `setValue`.
 */
export default function createValue(value, customSetValue) {
  const setValue = (newValue) => {
    if (customSetValue && typeof customSetValue === "function") {
      // biome-ignore lint/style/noParameterAssign:
      value = customSetValue();
    } else {
      // biome-ignore lint/style/noParameterAssign:
      value = newValue;
    }
  };

  const getValue = () => value;

  return [getValue, setValue];
}
