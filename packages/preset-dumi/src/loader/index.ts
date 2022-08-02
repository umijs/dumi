import transformer from '../transformer';
import getTheme from '../theme/loader';
import { getFileRangeLines, getFileContentByRegExp } from '../utils/getFileContent';

export default async function loader(raw: string) {
  let content = raw;
  const params = new URLSearchParams(this.resourceQuery);
  const range = params.get('range');
  const regexp = params.get('regexp');

  // extract content of markdown file
  if (range) {
    content = getFileRangeLines(content, range);
  } else if (regexp) {
    content = getFileContentByRegExp(content, regexp, this.resourcePath);
  }

  const result = transformer.markdown(content, this.resourcePath, {
    cacheKey: this.resource,
    throwError: true,
    masterKey: params.get('master'),
  });
  const theme = await getTheme();

  return `
    import React from 'react';
    import { dynamic } from 'dumi';
    import { Link, AnchorLink, context } from 'dumi/theme';
    ${theme.builtins
      .concat(theme.fallbacks)
      .concat(theme.customs)
      .map(component => `import ${component.identifier} from '${component.source}';`)
      .join('\n')}

    // memo for page content, to avoid useless re-render since other context fields changed
    const PageContent = React.memo(({ demos: DUMI_ALL_DEMOS }) => {
      ${(result.meta.demos || [])
        .map(item => `const ${item.name} = ${item.code}`)
        .join('\n')}

      return (
        <>
          ${(result.meta.translateHelp || '') &&
            `<Alert>${
              typeof result.meta.translateHelp === 'string'
                ? result.meta.translateHelp
                : 'This article has not been translated yet. Want to help us out? Click the Edit this doc on GitHub at the end of the page.'
            }</Alert>`}
          ${result.content}
        </>
      );
    })

    export default (props) => {
      const { demos } = React.useContext(context);

      // scroll to anchor after page component loaded
      React.useEffect(() => {
        if (props?.location?.hash) {
          AnchorLink.scrollToAnchor(decodeURIComponent(props.location.hash.slice(1)));
        }
      }, []);

      return <PageContent demos={demos} />;
  }`;
}
