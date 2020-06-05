import { Generator, winPath } from '@umijs/utils';
import { join } from 'path';

export default class AppGenerator extends Generator {
  async writing() {
    const cwd = winPath(this.cwd);
    const packageName = this.args.name || cwd.split('/').pop();
    this.copyDirectory({
      context: {
        version: require('../../package').version,
        siteMode: this.args.site,
        packageName,
      },
      path: join(__dirname, '../../templates/AppGenerator'),
      target: this.cwd,
    });
  }
}
