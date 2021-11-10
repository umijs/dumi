import path from 'path';
import fs from 'fs';
import transformer from '..';
import { registerMdComponent } from '../remark/mdComponent';

describe('markdown component examples', () => {
  const fixtures = path.join(__dirname, '../fixtures/remark-components');

  it('Should NOT transform unrecognized markdown component', () => {
    const filePath = path.join(fixtures, 'index.md');
    const result = transformer.markdown(
      fs.readFileSync(filePath, 'utf8').toString(),
      filePath,
    ).content;

    // compare transform content
    expect(result).toEqual(`<div className="markdown"><Test /></div>`);
  });

  it('Should transform recognized markdown component', () => {
    // register mdComponents
    registerMdComponent({
      name: 'Test',
      component: path.join(fixtures, 'remark-components', 'Test.js'),
      compiler(node, index, parent) {
        // insert a h3 title before Test component
        parent.children.splice(
          index,
          0,
          ...[
            {
              type: 'element',
              tagName: 'h3',
              properties: { id: `markdown-components` },
              children: [],
            },
          ],
        );
      },
    });

    const filePath = path.join(fixtures, 'test.md');
    const result = transformer.markdown(
      fs.readFileSync(filePath, 'utf8').toString(),
      filePath,
    ).content;

    // compare transform content
    expect(result).toEqual(
      `<div className=\"markdown\"><h3 id=\"markdown-components\"><AnchorLink to=\"#markdown-components\" aria-hidden=\"true\" tabIndex={-1}><span className=\"icon icon-link\" /></AnchorLink></h3><Test /></div>`,
    );
  });

  it('Should support to replace the markdown component', () => {
    // register another Test component
    registerMdComponent({
      name: 'Test',
      component: path.join(fixtures, 'remark-components', 'Test.js'),
      compiler(node, index, parent) {
        // insert a h3 title before Test component
        parent.children.splice(
          index,
          0,
          ...[
            {
              type: 'element',
              tagName: 'h3',
              properties: { id: `another-markdown-components` },
              children: [],
            },
          ],
        );
      },
    });

    const filePath = path.join(fixtures, 'another.md');
    const result = transformer.markdown(
      fs.readFileSync(filePath, 'utf8').toString(),
      filePath,
    ).content;

    // compare transform content
    expect(result).toEqual(
      `<div className=\"markdown\"><h3 id=\"another-markdown-components\"><AnchorLink to=\"#another-markdown-components\" aria-hidden=\"true\" tabIndex={-1}><span className=\"icon icon-link\" /></AnchorLink></h3><Test /></div>`,
    );
  });
});
