/// <reference types="react-scripts" />

// react-scripts only declares '*.module.css' (CSS Modules), not plain '*.css',
// so a side-effect import like `import './index.css'` has no ambient type otherwise.
declare module '*.css';
