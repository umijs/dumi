import type { IMdTransformerResult } from '../..';

export default (ret: IMdTransformerResult) => {
  // jsxify
  expect(ret.content).toEqual(
    '<><div className="markdown"><h1 id="first-level-title"><a aria-hidden="true" tabIndex="-1" href="#first-level-title"><span className="icon icon-link" /></a>{"first-level title"}</h1><h2 id="second-level-title"><a aria-hidden="true" tabIndex="-1" href="#second-level-title"><span className="icon icon-link" /></a>{"second-level title"}</h2><h3 id="third-level-title"><a aria-hidden="true" tabIndex="-1" href="#third-level-title"><span className="icon icon-link" /></a>{"third-level title"}</h3><h4 id="fourth-level-title"><a aria-hidden="true" tabIndex="-1" href="#fourth-level-title"><span className="icon icon-link" /></a>{"fourth-level title"}</h4><h5 id="fifth-level-title"><a aria-hidden="true" tabIndex="-1" href="#fifth-level-title"><span className="icon icon-link" /></a>{"fifth-level title"}</h5><h6 id="sixth-level-title"><a aria-hidden="true" tabIndex="-1" href="#sixth-level-title"><span className="icon icon-link" /></a>{"sixth-level title"}</h6><hr /><p><strong>{"strong"}</strong><em>{"italic"}</em><del>{"strike through"}</del><code>{"inline code"}</code></p><blockquote><p>{"quote"}</p><blockquote><p>{"nested quote"}</p></blockquote></blockquote><ul><li>{"unordered list\\n"}<ul><li>{"nested item"}</li></ul></li><li>{"another item"}</li></ul><ol><li>{"ordered list"}</li><li>{"nested item"}</li></ol><ul><li>{"another item"}</li></ul><SourceCode lang="css">{"/* code block */\\n"}</SourceCode><pre>{"manual pre tag\\n"}</pre><table><thead><tr><th>{"header-left"}</th><th align="right">{"header-right"}</th></tr></thead><tbody><tr><td>{"cell-left"}</td><td align="right">{"cell-right"}</td></tr></tbody></table><p><a href="https://d.umijs.org">{"link"}</a></p><p>{"Auto-link: "}<a href="https://d.umijs.org">{"https://d.umijs.org"}</a></p><p><img src="https://d.umijs.org" alt="img" /></p></div></>;\n',
  );

  // strip \n
  expect(ret.content).not.toContain('{"\n"}');
};
