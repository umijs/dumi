# Element Plus

暂不支持组件的全局导入，但支持按需导入

轻量级 Demo 只支持组件代码的导入，需自行导入样式

```vue
<template>
  <el-button>{{ msg }}</el-button>
</template>
<script setup>
import { ref } from 'vue';
const msg = ref('我是 ElButton');
</script>
<script>
import { ElButton } from 'element-plus';
import 'element-plus/es/components/button/style/css';
export default {
  components: { ElButton },
};
</script>
```

外置组件可以通过配置 webpack 来实现组件的自动导入或是按需导入

<code src="./external/App.vue"></code>

这里使用手动按需导入

```ts
// import AutoImport from 'unplugin-auto-import/webpack';
// import Components from 'unplugin-vue-components/webpack';
// import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default {
  chainWebpack(memo) {
    memo.plugin('unplugin-element-plus').use(
      require('unplugin-element-plus/webpack')({
        useSource: true,
      }),
    );
    // memo.plugin('auto-import').use(AutoImport( {
    //   resolvers: [ElementPlusResolver()],
    // }));
    // memo.plugin('components').use(Components({
    //   resolvers: [ElementPlusResolver()],
    // }));
    return memo;
  },
};
```

## TSX

```tsx
import { ElBreadcrumb, ElBreadcrumbItem } from 'element-plus';
import 'element-plus/es/components/breadcrumb/style/css';
import { defineComponent } from 'vue';

const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
];
export default defineComponent({
  setup() {
    return () => (
      <ElBreadcrumb separator="/">
        <ElBreadcrumbItem to={{ path: '/' }}>homepage</ElBreadcrumbItem>
        <ElBreadcrumbItem>
          <a href="/">promotion management</a>
        </ElBreadcrumbItem>
        <ElBreadcrumbItem>promotion list</ElBreadcrumbItem>
        <ElBreadcrumbItem>promotion detail</ElBreadcrumbItem>
      </ElBreadcrumb>
    );
  },
});
```
