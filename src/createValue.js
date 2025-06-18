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
      value = customSetValue();
    } else {
      value = newValue;
    }
  };

  const getValue = () => value;

  return [getValue, setValue];
}
