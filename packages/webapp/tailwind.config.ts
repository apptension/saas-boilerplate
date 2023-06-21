import { join } from 'path';

import { createGlobPatternsForDependencies } from '@nx/react/tailwind';
import { Config } from 'tailwindcss';

const packagesDir = __dirname.replace('/webapp', '');
// fixing HMR issue with the components outside the webapp root folder
const patterns = createGlobPatternsForDependencies('.', '/**/!(*.stories|*.spec).{tsx,jsx,ts,js,html}').map((p) =>
  p.replace(packagesDir, '..')
);

module.exports = {
  content: ['./index.html', join(__dirname, 'src/**/*!(*.stories|*.spec).{js,ts,jsx,tsx}'), ...patterns],
  theme: {
    extend: {},
  },
  plugins: [],
  presets: [require('../../tailwind.workspace-preset')],
} as Config;
