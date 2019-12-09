function notNull(x) {
  return x !== null;
}

function getMarkdownHeaders(lines, maxHeaderLevel) {
  function extractText(header) {
    return header.children
      .map(function (x) {
        if (x.type === "text") {
          return x.value;
        } else {
          return "*";
        }
      })
      .join("");
  }
  return lines
    .map(function (x) {
      return !maxHeaderLevel || x.depth <= maxHeaderLevel
        ? { rank: x.depth, name: extractText(x) }
        : null;
    })
    .filter(notNull);
}
const parseRoutes = (routes = []) => {
  const routesObject = {};
  let rootNode = null;
  let rootIndex = 0;
  for (let i = 0; i < routes.length; i++) {
    const item = routes[i];
    if (rootNode === null) {
      rootNode = item;
      rootIndex = i;
    } else if (item.rank <= rootNode.rank) {
      const subRoutes = routes.slice(rootIndex + 1, i);
      routesObject[rootNode.name] = parseRoutes(subRoutes);
      rootNode = item;
      rootIndex = i;
    }
  }
  if (rootIndex === routes.length - 1) {
    routesObject[rootNode.name] = {};
  } else if (rootNode) {
    const restRoutes = routes.slice(rootIndex + 1, routes.length);
    routesObject[rootNode.name] = parseRoutes(restRoutes);
  } else {
  }
  return routesObject;
};

export default (data, maxHeaderLevel) => {
  return parseRoutes(getMarkdownHeaders(data, maxHeaderLevel));
};
