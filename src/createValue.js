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
