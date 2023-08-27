import { __private__ } from './rehypeRaw';

const { addCustomPropsToMatchingJSX } = __private__;

describe('rehypeRaw', () => {
  describe('addCustomPropsToMatchingJSX', () => {
    it('should return the original string when there are no jsx fragments to match', () => {
      const input = 'foo bar';
      expect(addCustomPropsToMatchingJSX(input)).toBe(input);
    });

    it('should match jsx fragments without children', () => {
      const input = '<Foo />';
      expect(addCustomPropsToMatchingJSX(input)).toMatchInlineSnapshot(
        '"<Foo $tag-name=\\"Foo\\" />"',
      );
    });

    it('should match jsx fragments that contain children', () => {
      const input = '<Foo>bar</Foo>';
      expect(addCustomPropsToMatchingJSX(input)).toMatchInlineSnapshot(
        '"<Foo $tag-name=\\"Foo\\" >bar</Foo>"',
      );
    });

    it('should match multiple jsx fragments', () => {
      const input = `
<Foo>bar</Foo>
<Bar>foo</Bar>
<Footer />
      `.trim();
      expect(addCustomPropsToMatchingJSX(input)).toMatchInlineSnapshot(`
        "<Foo $tag-name=\\"Foo\\" >bar</Foo>
        <Bar $tag-name=\\"Bar\\" >foo</Bar>
        <Footer $tag-name=\\"Footer\\" />"
      `);
    });

    it('should match jsx fragments containing props', () => {
      const input = `
<Foo props="123" />
<Foo props="ReutersType<Props>" />
<Foo props="ReutersType<Props>"></Foo>
<Foo props="ReutersType<Props>">bar</Foo>
`.trim();
      expect(addCustomPropsToMatchingJSX(input)).toMatchInlineSnapshot(`
        "<Foo $tag-name=\\"Foo\\" props=\\"123\\" />
        <Foo $tag-name=\\"Foo\\" props=\\"ReutersType<Props>\\" />
        <Foo $tag-name=\\"Foo\\" props=\\"ReutersType<Props>\\"></Foo>
        <Foo $tag-name=\\"Foo\\" props=\\"ReutersType<Props>\\">bar</Foo>"
      `);
    });

    it('should match nested jsx components', () => {
      const createInput = (childrenStr: string) =>
        `
<Foo props="123" />
<Foo props="ReutersType<Props>" />
<Foo props="ReutersType<Props>"></Foo>
<Foo props="ReutersType<Props>">bar</Foo>
<Foo props="ReutersType<Props>">${childrenStr}</Foo>
`.trim();

      // nested
      const input = createInput(createInput(createInput('bar')));
      expect(addCustomPropsToMatchingJSX(input)).toMatchSnapshot();
    });
  });
});
