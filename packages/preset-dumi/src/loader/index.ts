import path from 'path';
import slash from 'slash2';
import transformer from '../transformer';
import ctx from '../context';

export default async function loader(content: string) {
  const result = transformer.markdown(content, this.resource);
  let builtins =
    (await ctx.umi?.applyPlugins({
      key: 'dumi.modifyThemeBuiltins',
      type: ctx.umi.ApplyPluginsType.modify,
      initialValue: [],
    })) || [];

  return `
    import { Link } from 'umi';
    import React from 'react';
    import Alert from '${slash(path.join(__dirname, '../themes/default/builtins/Alert.js'))}';
    import Badge from '${slash(path.join(__dirname, '../themes/default/builtins/Badge.js'))}';
    import SourceCode from '${slash(
      path.join(__dirname, '../themes/default/builtins/SourceCode.js'),
    )}';
    import DumiPreviewer from '${slash(
      path.join(__dirname, '../themes/default/builtins/Previewer.js'),
    )}';
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
