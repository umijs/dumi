import path from 'path';

export default {
    history: { type: "memory" },
    mountElementId: "",
    alias: {
      '@': path.resolve(__dirname, './component'),
    }
};
  