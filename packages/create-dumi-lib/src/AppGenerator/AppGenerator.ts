import { Generator, winPath } from '@umijs/utils';
import { join } from 'path';

export default class AppGenerator extends Generator {
  async writing() {
    const cwd = winPath(this.cwd);
    this.copyDirectory({
      context: {
        version: require('../../package').version,
        siteMode: this.args.site,
        packageName: cwd.split('/').pop(),
      },
      path: join(__dirname, '../../templates/AppGenerator'),
      target: this.cwd,
    });
  }
}
