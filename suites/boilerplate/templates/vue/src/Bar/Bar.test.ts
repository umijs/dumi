import { mount, type VueWrapper } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import Bar from './RootBar.vue';

describe('Bar', () => {
  let wrapper: VueWrapper<InstanceType<typeof Bar>>;

  beforeEach(() => {
    wrapper = mount(Bar, { props: { icon: 'V' } });
  });

  it('should render', () => {
    expect(wrapper.html()).contain('V');
  });
});
