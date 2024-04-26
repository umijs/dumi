import { describe, expect, test } from 'vitest';
import { compiler } from '../node';

const { compileSFC } = compiler;

describe('Vue SFC compilation test', () => {
  test('script setup', () => {
    expect(
      compileSFC({
        id: 'xx',
        code: `
        <script setup>
        console.log('hello');
        </script>
      `,
        filename: 'xx.vue',
      }),
    ).toMatchSnapshot();
  });
  test('script setup + template', () => {
    expect(
      compileSFC({
        id: 'xx',
        code: `
        <script setup>
          const msg = 'Hello!'
          function log() {
            console.log(msg)
          }
        </script>
        <template>
          <button @click="log">{{ msg }}</button>
        </template>
      `,
        filename: 'xx.vue',
      }),
    ).toMatchSnapshot();
  });

  test('two script tags', () => {
    expect(
      compileSFC({
        id: 'xx',
        code: `
        <script>
        export default {
          props: ['p'],
        };
        </script>
        <script setup>
        import { ref } from 'vue';
        import Button from '@lib';
        const msg = ref('hello')
        </script>
        <template>
          <Button @click="log">{{ msg }}</Button>
        </template>
      `,
        filename: 'xx.vue',
      }),
    ).toMatchSnapshot();
  });

  test('script setup + ts', () => {
    expect(
      compileSFC({
        id: 'xx',
        code: `
        <script setup lang="ts" generic="T">
        defineProps<{
          id: T,
          msg: string
        }>()
        </script>
        <template>
        {{msg}}
        </template>
      `,
        filename: 'xx.vue',
      }),
    ).toMatchSnapshot();
  });

  test('script setup + tsx', () => {
    expect(
      compileSFC({
        id: 'xx',
        code: `
        <script lang="tsx">
        export default {
          setup() {
            return () => <>hello</>;
          },
        };
        </script>
      `,
        filename: 'xx.vue',
      }),
    ).toMatchSnapshot();
  });

  test('script options + jsx', () => {
    expect(
      compileSFC({
        id: 'xx',
        code: `
        <script lang="jsx">
        export default {
          data() {
            return { visible: true };
          },
          render() {
            return <input v-show={this.visible} />;
          },
        };
        </script>
      `,
        filename: 'xx.vue',
      }),
    ).toMatchSnapshot();
  });

  test('scoped style', () => {
    expect(
      compileSFC({
        id: 'xx',
        code: `
        <style scoped>
        .example {
          color: v-bind(color);
        }
        </style>
        <script setup>
        const color = 'red';
        </script>
        <template>
          <div class="example">hi</div>
        </template>
      `,
        filename: 'xx.vue',
      }),
    ).toMatchSnapshot();
  });

  test('template only', () => {
    expect(
      compileSFC({
        id: 'xx',
        code: `
        <template>
          <p>template only</p>
        </template>
      `,
        filename: 'xx.vue',
      }),
    ).toMatchSnapshot();
  });

  test('custom preprocessors are not supported', () => {
    expect(
      compileSFC({
        id: 'xx',
        code: `
        <style lang="less">
        .example {
          .red {}
        }
        </style>
        <template>
          <p>custom preprocessors are not supported</p>
        </template>
      `,
        filename: 'xx.vue',
      }),
    ).toMatchSnapshot();
  });
});
