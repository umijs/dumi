import { ComponentEmit, ComponentExposed } from 'vue-component-type-helpers';
import Foo from './foo.vue';

export { default as Foo } from './foo.vue';

type Events = ComponentEmit<typeof Foo>;
type Exposed = ComponentExposed<typeof Foo>;
