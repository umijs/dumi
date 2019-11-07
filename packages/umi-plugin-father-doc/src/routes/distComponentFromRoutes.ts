import fs from 'fs';
import path from 'path';
import { IRoute, IApi } from 'umi-types';
import transformer from '../transformer';

const DIST_DIR = '.father-doc';

export default (paths: IApi['paths'], routes: IRoute[]) => {
  const distPath = path.join(paths.absPagesPath, DIST_DIR);

  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath);
  }

  routes.forEach((route) => {
    const cPath = route.component as string;
    const cPathParsed = path.parse(cPath);
    const filePrefix = route.routes ? '' : 'p__';
    // convert Button/index.md -> p__Button.js as filename
    const filename = `${
      filePrefix
    }${
      cPathParsed
        .dir
        .replace(paths.absPagesPath, '') // discard base path
        .replace(/^(\/|\\)/, '') // discard head dir separator
        .split(/\/|\\/)
        .join('__')
    }.jsx`;
    const distFilePath = path.join(distPath, filename);
    let componentContent = fs.readFileSync(cPath).toString();

    switch (cPathParsed.ext) {
      case '.md':
        // todo: handle YAML config
        componentContent = transformer.markdown(componentContent, cPathParsed.dir).content;
        break;
      default:
    }

    // distribute component to temp dir
    fs.writeFileSync(distFilePath, componentContent);

    // update route config
    route.component = distFilePath;
  });
}
