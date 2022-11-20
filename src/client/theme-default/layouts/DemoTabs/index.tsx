import React, { useState, useEffect } from 'react';
import { useRouteMeta } from 'dumi';
import './index.less';

export default function DemoTabs() {
  const [activedId, setActivedId] = useState('');

  const { toc } = useRouteMeta();

  const onSyncAffix = () => {
    const { scrollY } = window;
    const apiDoms = Array.from(document.querySelectorAll('h2[id]')).map(({ id }) => id);

    for (let i = 0; i < apiDoms.length; i++) {
      const current = document.getElementById(apiDoms[i]);
      // 元素在当前页面的位置，负数则表示已经滚过
      if (current) {
        const currentInNowPageY = current?.offsetTop - scrollY;
        if (currentInNowPageY >= 0) {
          setActivedId(apiDoms[i]);
          return;
        }
      }
    }
  };

  const isInViewport = (dom) => {
    // 兼容写法
    let viewPortHeight = window.innerHeight || document.documentElement.clientHeight;
    let viewPortWidth = window.innerWidth || document.documentElement.clientWidth;
    let { top, left, bottom, right } = dom.getBoundingClientRect();

    // 返回元素是否在视口内、元素距离视窗顶部距离
    return {
      res: top >= 0 && left >= 0 && bottom <= viewPortHeight && right <= viewPortWidth,
      top,
    };
  };

  const scrollToId = (id: string) => {
    const clickNode = document.getElementById(id);

    if (clickNode) {
      const scrollTop = clickNode.offsetTop;
      const htmlNode = document.documentElement;
      let beforeTop;

      function scroll() {
        const nowTop = window.scrollY;
        const { res, top } = isInViewport(clickNode);
        // 元素出现在视口内，并且顶部距离符合条件
        if (res && top > 0 && top < 80) {
          return;
        }
        if (scrollTop > nowTop) {
          htmlNode.scrollTop += 80;
        } else {
          htmlNode.scrollTop -= 80;
        }
        // 保存上一次状态，防止滚动到底部时，scrollTop不变，重复执行scroll
        beforeTop = htmlNode.scrollTop;
        if (nowTop === beforeTop) return;
        window.requestAnimationFrame(scroll);
      }
      window.requestAnimationFrame(scroll);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', onSyncAffix);
    window.addEventListener('resize', onSyncAffix);
    onSyncAffix();

    return () => {
      window.removeEventListener('scroll', onSyncAffix);
      window.removeEventListener('resize', onSyncAffix);
    };
  });

  return (
    <ul className="dumi-default-doc-tabs">
      {toc.slice(1).map(({ id }) => {
        return (
          <li key={id}>
            <a
              className={id === activedId ? 'active' : ''}
              onClick={() => scrollToId(id)}
              aria-current="page"
            >
              <span>{id}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
