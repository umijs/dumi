import { useEffect, useState } from 'react';

/**
 * get active anchor
 * @param anchors anchor list
 */

interface anchor {
  depth: number;
  value: string;
  heading: string;
}

function useLinkHighlight(anchors: anchor[]): string {
  const [activeHash, setActiveHash] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Remove brower memory browsing
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    function setActiveLink() {
      function getActiveHeaderAnchor(): Element | null {
        const headersAnchors: Element[] = [];

        anchors.map(slug => {
          const target = document.querySelector(`#${slug.heading}`)
          target ?? headersAnchors.push(target);
        });

        const firstAnchorUnderViewportTop = headersAnchors.find(anchor => {
            const { top } = anchor.getBoundingClientRect();
            return top > 100;
        });

        if (firstAnchorUnderViewportTop) {
          // If first anchor in viewport is under a certain threshold, we consider it's not the active anchor.
          // In such case, the active anchor is the previous one (if it exists), that may be above the viewport
          if (firstAnchorUnderViewportTop.getBoundingClientRect().top > 100) {
            const previousAnchor =
              headersAnchors[headersAnchors.indexOf(firstAnchorUnderViewportTop) - 1];

            return previousAnchor ?? firstAnchorUnderViewportTop;
          }
          // If the anchor is at the top of the viewport, we consider it's the first anchor
          else {
            return firstAnchorUnderViewportTop;
          }
        }
        // no anchor under viewport top? (ie we are at the bottom of the page)
        else {
          // highlight the last anchor found
          return headersAnchors[headersAnchors.length - 1];
        }
      }
      const activeHeaderAnchor = getActiveHeaderAnchor();

      if (activeHeaderAnchor) {
        let index = 0;
        let itemHighlighted = false;

        while (index < anchors.length && !itemHighlighted) {
          const { heading } = anchors[index];

          if (activeHeaderAnchor.id === heading) {
            setActiveHash(heading);
            console.log(heading);
            itemHighlighted = true;
          }

          index += 1;
        }
      }
    }

    document.addEventListener('scroll', setActiveLink);
    document.addEventListener('resize', setActiveLink);

    setActiveLink();

    return () => {
      document.removeEventListener('scroll', setActiveLink);
      document.removeEventListener('resize', setActiveLink);
    };
  }, []);

  return activeHash;
}

export default useLinkHighlight;
