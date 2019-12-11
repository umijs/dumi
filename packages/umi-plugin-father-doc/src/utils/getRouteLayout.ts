import slugAnchor from "./slugAnchor";

const notNull = x => {
  return x !== null;
};

const formatLayoutData = (data, maxHeaderLevel) => {
  const extractText = header => {
    return header.children
      .map(function (x) {
        if (x.type === "text") {
          return x.value;
        } else {
          return "*";
        }
      })
      .join("");
  };
  return data
    .map(x => {
      return !maxHeaderLevel || x.depth <= maxHeaderLevel
        ? {
          depth: x.depth,
          value: extractText(x),
          heading: slugAnchor(extractText(x))
        }
        : null;
    })
    .filter(notNull);
};
export default (data: any, maxHeaderLevel: number = 2) => {
  return formatLayoutData(data, maxHeaderLevel);
};
