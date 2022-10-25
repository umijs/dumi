import { useAppData, useNavData, useSiteData } from 'dumi';
import { findAll } from 'highlight-words-core';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { IRouteMeta } from './types';
import { TAB_QUERY_KEY } from './useTabMeta';
import { useLocaleDocRoutes } from './utils';

interface IHighlightText {
  highlighted?: boolean;
  text: string;
}

interface ISearchNavResult {
  title?: string;
  priority: number;
  hints: {
    type: 'page' | 'title' | 'demo' | 'content';
    link: string;
    priority: number;
    highlightTitleTexts: IHighlightText[];
    highlightTexts: IHighlightText[];
  }[];
}

type ISearchResult = ISearchNavResult[];

type ISearchMetadata = {
  navTitle?: string;
  navOrder: number;
  title: string;
  link: string;
  sections: {
    title: string;
    rawTitle: string;
    link: string;
    paragraphs: string[];
  }[];
  demos: {
    link: string;
    title: string;
    rawTitle: string;
    keywords: string[];
    description: string;
  }[];
}[];

/**
 * create section by title
 */
function createMetadataSection(
  rawTitle: string,
  title: string,
  link: string,
  texts: IRouteMeta['texts'],
): ISearchMetadata[0]['sections'][0] | null;
function createMetadataSection(
  rawTitle: string,
  title: string,
  link: string,
  texts: IRouteMeta['texts'],
  tocIndex: number,
): ISearchMetadata[0]['sections'][0];
function createMetadataSection(
  rawTitle: string,
  title: string,
  link: string,
  texts: IRouteMeta['texts'],
  tocIndex?: number,
) {
  const allowEmptyParas = tocIndex !== undefined;
  const paragraphs = texts
    .reduce<string[]>((acc, text) => {
      if (text.tocIndex === tocIndex) {
        acc[text.paraId] = (acc[text.paraId] || '').concat(text.value);
      }
      return acc;
    }, [])
    .filter(Boolean);

  return Boolean(paragraphs.length) || allowEmptyParas
    ? {
        rawTitle,
        title,
        link,
        paragraphs: texts
          .reduce<string[]>((acc, text) => {
            if (text.tocIndex === tocIndex) {
              acc[text.paraId] ??= '';
              acc[text.paraId] += text.value;
            }
            return acc;
          }, [])
          .filter(Boolean),
      }
    : null;
}

function generateSearchMetadata(
  routes: ReturnType<typeof useAppData>['routes'],
  demos: ReturnType<typeof useSiteData>['demos'],
  nav: ReturnType<typeof useNavData>,
) {
  const metadata: ISearchMetadata = [];
  // generate demos mapping by route.id
  const demosMapping = Object.values(demos).reduce<
    Record<string, typeof demos[0][]>
  >((acc, demo) => {
    if (demo.asset) {
      acc[demo.routeId] ??= [];
      acc[demo.routeId].push(demo);
    }
    return acc;
  }, {});

  Object.values(routes).forEach((route) => {
    // only process content route
    if ('meta' in route && !('isLayout' in route)) {
      const routeMeta: IRouteMeta = (route as any).meta;
      const routeAbsPath = route.path!.replace(/^([^/])/, '/$1') || '/';
      const routeNav = nav.find(
        (item) =>
          routeAbsPath === item.link ||
          routeAbsPath.startsWith(`${item.activePath}/`),
      );
      const demoIds = (demosMapping[route.id] || []).map(
        (demo) => demo.asset?.id,
      );
      const orphanSection = createMetadataSection(
        '',
        routeMeta.frontmatter.title,
        routeAbsPath,
        routeMeta.texts,
      );
      const tocSections = routeMeta.toc.reduce<ISearchMetadata[0]['sections']>(
        (acc, toc, i) => {
          // exclude demo id, to avoid duplicate
          if (!demoIds.includes(toc.id) && toc.depth > 1) {
            acc.push(
              createMetadataSection(
                toc.title,
                `${routeMeta.frontmatter.title} - ${toc.title}`,
                `${routeAbsPath}#${toc.id}`,
                routeMeta.texts,
                i,
              ),
            );
          }

          return acc;
        },
        [],
      );
      const tabSections = (routeMeta.tabs || []).reduce<typeof tocSections>(
        (acc, { key, meta }) => {
          // collect orphan section that not in toc
          const tabOrphanSection = createMetadataSection(
            '',
            `${routeMeta.frontmatter.title} - ${meta.frontmatter.title}`,
            `${routeAbsPath}?${TAB_QUERY_KEY}=${key}`,
            meta.texts,
          );

          if (tabOrphanSection) acc.push(tabOrphanSection);

          // collect sections by toc
          acc.push(
            ...meta.toc.map((toc, i) =>
              createMetadataSection(
                toc.title,
                `${routeMeta.frontmatter.title} - ${meta.frontmatter.title} - ${toc.title}`,
                `${routeAbsPath}?${TAB_QUERY_KEY}=${key}#${toc.id}`,
                meta.texts,
                i,
              ),
            ),
          );

          return acc;
        },
        [],
      );

      metadata.push({
        navTitle: routeNav?.title,
        navOrder: routeNav ? nav.indexOf(routeNav) : Infinity,
        title: routeMeta.frontmatter.title,
        link: routeAbsPath,
        sections: [
          ...(orphanSection ? [orphanSection] : []),
          ...tocSections,
          ...tabSections,
        ],
        demos:
          demosMapping[route.id]?.map((demo) => ({
            link: `${routeAbsPath}#${demo.asset.id}`,
            rawTitle: demo.asset.title || '',
            title: demo.asset.title || routeMeta.frontmatter.title,
            description: demo.asset.description || '',
            keywords: demo.asset.keywords || [],
          })) || [],
      });
    }
  });

  return metadata;
}

function generateHighlightTexts(
  str = '',
  keywords: string[],
): [IHighlightText[], Record<string, boolean>] {
  const chunks = findAll({
    textToHighlight: str,
    searchWords: keywords,
    autoEscape: true,
  });
  // save matched keywords
  const matchedMapping: Record<string, boolean> = {};

  return [
    chunks.map(({ start, end, highlight }, i) => {
      const highlightText: IHighlightText = {
        text: str.slice(start, end),
      };

      // omit long str before the first highlighted text
      if (
        i === 0 &&
        !highlight &&
        chunks.length > 1 &&
        highlightText.text.length > 20
      ) {
        highlightText.text = `...${highlightText.text.slice(-20)}`;
      }

      // mark highlight
      if (highlight) {
        highlightText.highlighted = true;
        matchedMapping[keywords.find((k) => highlightText.text.includes(k))!] =
          true;
      }

      return highlightText;
    }),
    matchedMapping,
  ];
}

function generateSearchResult(metadata: ISearchMetadata, keywordsStr: string) {
  const keywords = keywordsStr.split(' ');
  const matchReg = new RegExp(
    keywordsStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(' ', '|'),
    'gi',
  );
  const resultMapping: Record<string, ISearchNavResult> = {};

  // traverse metadata from all routes
  metadata.forEach((data) => {
    const hints: ISearchResult[0]['hints'] = [];

    // find content & section hints
    data.sections.forEach((sec) => {
      // find matched keywords in paragraph
      for (let p of sec.paragraphs) {
        if (matchReg.test(p)) {
          const [highlightTitleTexts, titleMatchMapping] =
            generateHighlightTexts(sec.title, keywords);
          const [highlightTexts, matchMapping] = generateHighlightTexts(
            p,
            keywords,
          );

          hints.push({
            type: 'content',
            link: sec.link,
            priority: Object.keys({ ...titleMatchMapping, ...matchMapping })
              .length,
            highlightTitleTexts,
            highlightTexts,
          });

          // match at most once in the same section
          return;
        }
      }

      // find matched keywords in section title
      if (matchReg.test(sec.rawTitle)) {
        const [highlightTitleTexts, titleMatchMapping] = generateHighlightTexts(
          sec.title,
          keywords,
        );

        hints.push({
          type: 'title',
          link: sec.link,
          priority: Object.keys(titleMatchMapping).length,
          highlightTitleTexts,
          highlightTexts: generateHighlightTexts(
            sec.paragraphs[0] || '',
            keywords,
          )[0],
        });
      }
    });

    // find demo hints
    data.demos.forEach((demo) => {
      if (matchReg.test(demo.rawTitle) || matchReg.test(demo.description)) {
        const [highlightTitleTexts, titleMatchMapping] = generateHighlightTexts(
          demo.title,
          keywords,
        );
        const [highlightTexts, matchMapping] = generateHighlightTexts(
          demo.description,
          keywords,
        );

        hints.push({
          type: 'demo',
          link: demo.link,
          priority: Object.keys({ ...titleMatchMapping, ...matchMapping })
            .length,
          highlightTitleTexts,
          highlightTexts,
        });
      }
    });

    // find page hints
    if (matchReg.test(data.title)) {
      const [highlightTitleTexts, titleMatchMapping] = generateHighlightTexts(
        data.title,
        keywords,
      );

      hints.push({
        type: 'page',
        link: data.link,
        priority: Object.keys(titleMatchMapping).length,
        highlightTitleTexts,
        highlightTexts: generateHighlightTexts(
          data.sections[0]?.paragraphs[0] || '',
          keywords,
        )[0],
      });
    }

    // create nav result if there has any hint
    if (hints.length) {
      const key = data.navTitle || '$ROOT';

      resultMapping[key] ??= {
        title: data.navTitle,
        priority: data.navOrder,
        hints: [],
      };
      resultMapping[key].hints.push(...hints);
    }
  });

  // sort hints
  Object.values(resultMapping).forEach(({ hints }) => {
    hints.sort((prev, next) => next.priority - prev.priority);
  });

  return Object.values(resultMapping).sort(
    (prev, next) => next.priority - prev.priority,
  );
}

export const useSiteSearch = () => {
  const debounceTimer = useRef<number>();
  const routes = useLocaleDocRoutes();
  const { demos } = useSiteData();
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState('');
  const navData = useNavData();
  const [metadata, setMetadata] = useState<ISearchMetadata>([]);
  const [result, setResult] = useState<ISearchResult>([]);
  const setter = useCallback((val: string) => {
    setLoading(true);
    setKeywords(val);
  }, []);

  useEffect(() => {
    setMetadata(generateSearchMetadata(routes, demos, navData));
  }, [routes, demos, navData]);

  useEffect(() => {
    const str = keywords.trim();

    if (str) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = window.setTimeout(() => {
        setResult(generateSearchResult(metadata, str));
        setLoading(false);
      }, 100);
    } else {
      setResult([]);
    }
  }, [keywords, metadata]);

  return { keywords, setKeywords: setter, result, loading };
};
