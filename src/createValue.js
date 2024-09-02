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
