import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { Foo } from './index';

describe('Foo', () => {
  it('should render', () => {
    const wrapper = mount(Foo, { props: { title: 'foo' } });
    expect(wrapper.html()).contain('foo');
  });
});
