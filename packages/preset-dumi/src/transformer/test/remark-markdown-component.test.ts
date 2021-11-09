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
        node._dumi_parsed = true;
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
});
