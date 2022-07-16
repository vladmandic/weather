export const color = {
  white: (str) => `<font color="white">${str}</font>`,
  green: (str) => `<font color="lightgreen">${str}</font>`,
  coral: (str) => `<font color="lightcoral">${str}</font>`,
  blue: (str) => `<font color="lightblue">${str}</font>`,
  yellow: (str) => `<font color="lightyellow">${str}</font>`,
  grey: (str) => `<font color="lightgray">${str}</font>`,
  dark: (str) => `<font color="gray">${str}</font>`,
  hex: (str, hex) => `<font color="#${hex}">${str}</font>`,
  ok: (str, bool) => (bool ? `<font color="lightgreen">${str}</font>` : `<font color="lightcoral">${str}</font>`),
};
