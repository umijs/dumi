import { useState, useEffect } from 'react';
import type { IPreviewerComponentProps } from '..';

const RIDDLE_API_ENDPOINT = 'https://riddle.alibaba-inc.com/riddles/define';
let isInternalNetwork: boolean | undefined;

const useInternalNet = () => {
  const [isInternal, setIsInternal] = useState<boolean>(Boolean(isInternalNetwork));

  useEffect(() => {
    if (isInternalNetwork === undefined) {
      // detect network via img request
      const img = document.createElement('img');

      // interrupt image pending after 200ms
      setTimeout(() => {
        img.src = '';
        img.remove();
      }, 200);

      img.onload = () => {
        isInternalNetwork = true;
        setIsInternal(true);
        img.remove();
      };

      img.src =
        'https://private-alipayobjects.alipay.com/alipay-rmsdeploy-image/rmsportal/RKuAiriJqrUhyqW.png';
    }
  }, []);

  return isInternal;
};

/**
 * get js code for Riddle
 * @param opts  previewer props
 */
function getRiddleAppCode(opts: IPreviewerComponentProps) {
  const { dependencies } = opts;
  let result = opts.sources._.tsx || (opts.sources._ as any).jsx;

  // convert export default to ReactDOM.render for riddle
  result = result
    .replace(/^/, `import ReactDOM from 'react-dom@${dependencies.react?.version || 'latest'}';\n`)
    .replace('export default', 'const DumiDemo =')
    .concat('\nReactDOM.render(<DumiDemo />, mountNode);');

  // add version for dependencies
  result = result.replace(/(from ')((?:@[^/'"]+)?[^/'"]+)/g, (_, $1, $2) => {
    let dep = `${$1}${$2}`;

    if (dependencies[$2]) {
      dep += `@${dependencies[$2].version}`;
    }

    return dep;
  });

  return result;
}

export default (opts: IPreviewerComponentProps | null) => {
  const [handler, setHandler] = useState<(...args: any) => void | undefined>();
  const isInternal = useInternalNet();

  useEffect(() => {
    if (
      opts &&
      isInternal &&
      // TODO: riddle is not support multiple files for currently
      Object.keys(opts.sources).length === 1
    ) {
      const form = document.createElement('form');
      const input = document.createElement('input');

      form.method = 'POST';
      form.target = '_blank';
      form.style.display = 'none';
      form.action = RIDDLE_API_ENDPOINT;
      form.appendChild(input);
      form.setAttribute('data-demo', opts.title || '');

      input.name = 'data';

      // create riddle data
      input.value = JSON.stringify({
        title: opts.titlle,
        js: getRiddleAppCode(opts),
        css: Object.entries(opts.dependencies)
          .filter(([, dep]) => dep.css)
          .map(
            ([name, { version, css }]) =>
              // generate to @import '~pkg@version/path/to/css' format
              `@import '~${css.replace(new RegExp(`^(${name})`), `$1@${version}`)}';`,
          )
          .join('\n'),
      });

      document.body.appendChild(form);

      setHandler(() => () => form.submit());

      return () => form.remove();
    }
  }, [opts, isInternal]);

  return handler;
};
