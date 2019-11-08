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
      path
        // get relative path and discard ext
        .relative(paths.absPagesPath, path.join(cPathParsed.dir, cPathParsed.name))
        .split(/\/|\\/)
        .join('__')
    }.jsx`;
    const distFilePath = path.join(distPath, filename);
    let componentContent = fs.readFileSync(cPath).toString();
    let result;

    switch (cPathParsed.ext) {
      case '.md':
        result = transformer.markdown(componentContent, cPathParsed.dir);
        componentContent = result.content;
        break;
      default:
    }

    // dynamic title support
    if (result && result.config.frontmatter.title) {
      route.title = result.config.frontmatter.title;
    }

    // distribute component to temp dir
    fs.writeFileSync(distFilePath, componentContent);

    // update route config
    route.component = distFilePath;
  });
}
