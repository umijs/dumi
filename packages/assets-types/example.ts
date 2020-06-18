import AssetsPackage from './typings';

const examplePackage: AssetsPackage = {
  name: 'Ant Design',
  package: 'antd',
  homepage: 'https://ant.design',
  assets: {
    atoms: [
      {
        identifier: 'Button',
        name: '按钮',
        'name.en-US': 'Button',
        props: {},
      },
    ],
    examples: [
      {
        type: 'COMPONENT',
        atomAssetId: 'Button',
        designId: '1.按钮/1.危险按钮',
        name: '危险按钮',
        'name.en-US': 'Danger Button',
        previewUrl: 'https://ant.design/components/button-cn/#components-button-demo-basic',
        props: {
          type: 'danger',
          children: '危险按钮',
        },
      },
      {
        type: 'BLOCK',
        atomAssetId: 'Button',
        designId: '1.按钮/2.和输入框一起使用',
        name: '和输入框一起使用',
        'name.en-US': 'Use with Input component',
        previewUrl: 'https://ant.design/components/button-cn/#components-button-demo-icon',
        dependencies: {
          'index.tsx': {
            type: 'FILE',
            value:
              "import React from 'react';\nimport { Button, Input } from 'antd';\n\nexport default () => <><Input /><Button>Hello</Button></>",
          },
        },
      },
    ],
  },
};

export default examplePackage;
