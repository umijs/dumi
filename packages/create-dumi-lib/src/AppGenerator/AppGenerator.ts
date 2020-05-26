import { Generator } from '@umijs/utils';
import { join } from 'path';

export default class AppGenerator extends Generator {
  async writing() {
    this.copyDirectory({
      context: {
        version: require('../../package').version,
        siteMode: this.args.site,
        packageName: this.cwd.split('/').pop(),
      },
      path: join(__dirname, '../../templates/AppGenerator'),
      target: this.cwd,
    });
  }
}
