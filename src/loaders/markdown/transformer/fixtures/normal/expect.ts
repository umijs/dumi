import type { IMdTransformerResult } from '../..';

export default (ret: IMdTransformerResult) => {
  // jsxify
  expect(ret.content).toEqual(
    '<><h1>{"first-level title"}</h1><h2>{"second-level title"}</h2><h3>{"third-level title"}</h3><h4>{"fourth-level title"}</h4><h5>{"fifth-level title"}</h5><h6>{"sixth-level title"}</h6><hr /><p><strong>{"strong"}</strong><em>{"italic"}</em><del>{"strike through"}</del><code>{"inline code"}</code></p><blockquote><p>{"quote"}</p><blockquote><p>{"nested quote"}</p></blockquote></blockquote><ul><li>{"unordered list\\n"}<ul><li>{"nested item"}</li></ul></li><li>{"another item"}</li></ul><ol><li>{"ordered list"}</li><li>{"nested item"}</li></ol><ul><li>{"another item"}</li></ul><pre><code className="language-css">{"/* code block */\\n"}</code></pre><pre>{"manual pre tag\\n"}</pre><table><thead><tr><th>{"header-left"}</th><th align="right">{"header-right"}</th></tr></thead><tbody><tr><td>{"cell-left"}</td><td align="right">{"cell-right"}</td></tr></tbody></table><p><a href="https://d.umijs.org">{"link"}</a></p><p>{"Auto-link: "}<a href="https://d.umijs.org">{"https://d.umijs.org"}</a></p><p><img src="https://d.umijs.org" alt="img" /></p></>;\n',
  );

  // strip \n
  expect(ret.content).not.toContain('{"\n"}');
};
