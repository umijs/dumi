import { TechStackRuntimeContext } from 'dumi';
import React from 'react';
import { openCodeSandbox, openStackBlitz } from './getPreviewerData';
import { renderToCanvas } from './render';

const vueTechStackRuntimeApi = {
  techStackName: 'vue3',
  openCodeSandbox,
  openStackBlitz,
  renderToCanvas,
};

export function rootContainer(container: React.ReactNode) {
  return (
    <TechStackRuntimeContext.Provider value={vueTechStackRuntimeApi}>
      {container}
    </TechStackRuntimeContext.Provider>
  );
}
