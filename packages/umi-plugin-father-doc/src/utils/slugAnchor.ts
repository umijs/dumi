const symbols = [
  // todo chinese & emoji
  "[",
  "]",
  "!",
  '"',
  "'",
  "#",
  "$",
  "%",
  "&",
  "(",
  ")",
  "*",
  "+",
  ",",
  ".",
  "/",
  ":",
  ";",
  "<",
  "=",
  ">",
  "?",
  "@",
  "",
  "",
  "^",
  "_",
  "`",
  "{",
  "|",
  "}",
  "~",
  "©",
  "∑",
  "®",
  "†",
  "“",
  "”",
  "‘",
  "’",
  "∂",
  "ƒ",
  "™",
  "℠",
  "…",
  "œ",
  "Œ",
  "˚",
  "º",
  "ª",
  "•",
  "∆",
  "∞",
  "♥",
  "&",
  "|"
];

function slug(content: string, separator?: string): string {
  separator = separator || "-";

  const re = new RegExp("[\\" + symbols.join("\\") + "]+", "g");
  let s = content
    .replace(re, "")
    .replace(/ /g, separator)
    .toLowerCase();

  if (s[0] === separator) {
    s = s.slice(1);
  }

  return s;
}

export default slug;
