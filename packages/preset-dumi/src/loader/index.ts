import transformer from '../transformer';
import ctx from '../context';
import getTheme from '../theme/loader';

export default async function loader(content: string) {
  const result = transformer.markdown(content, this.resource);
  const builtins =
    (await ctx.umi?.applyPlugins({
      key: 'dumi.modifyThemeBuiltins',
      type: ctx.umi.ApplyPluginsType.modify,
      initialValue: [],
    })) || [];
  const theme = getTheme();

  return `
    import React from 'react';
    import { Link, AnchorLink } from 'dumi/theme';
    ${theme.builtins
      .concat(theme.fallbacks)
      .map(component => `import ${component.identifier} from '${component.source}';`)
      .join('\n')}
    ${builtins
      .map(component => `import ${component.identifier} from '${component.source}';`)
      .join('\n')}

    ${(result.meta.demos || []).join('\n')}

    export default function () {
      return (
        <>
          ${
            result.meta.translateHelp
              ? '<Alert>This article has not been translated yet. Want to help us out? Click the Edit this doc on GitHub at the end of the page.</Alert>'
              : ''
          }
          ${result.content}
        </>
      );
  }`;
}
