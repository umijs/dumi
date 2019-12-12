const notNull = x => {
  return x !== null;
};

const headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

const formatLayoutData = (data, maxHeaderLevel) => {
  const checkHeadings = headings.slice(0, maxHeaderLevel);

  const extractText = header => {
    return header.children
      .map(function (x) {
        if (x.type === "text") {
          return x.value;
        } else {
          return "";
        }
      })
      .join("");
  };
  return data
    .map(x => {
      return checkHeadings.includes(x.tagName)
        ? {
          depth: parseInt(x.tagName[1],10),
          value: extractText(x),
          heading: x.properties.id
        }
        : null;
    })
    .filter(notNull);
};
export default (data: any, maxHeaderLevel: number = 2) => {
  return formatLayoutData(data, maxHeaderLevel);
};
