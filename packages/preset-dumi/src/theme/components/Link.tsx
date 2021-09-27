import React from 'react';
import { Link } from '@umijs/runtime';
import type { LinkProps, NavLinkProps } from 'react-router-dom';

/**
 * Link component wrapper for render external link
 * @param Component   original Link component
 */
export const LinkWrapper = (Component: React.FC<LinkProps | NavLinkProps>) => {
  return ({ to, ...props }: LinkProps | NavLinkProps) => {
    const isExternal = /^(\w+:)?\/\/|^(mailto|tel):/.test(to as string) || !to;
    const hasComplexChildren = React.isValidElement(props.children);

    return (
      <Component
        to={(to as any) || ''}
        component={
          isExternal
            ? () => (
                <a target="_blank" rel="noopener noreferrer" href={to as string}>
                  {props.children}
                  {to && !hasComplexChildren && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      x="0px"
                      y="0px"
                      viewBox="0 0 100 100"
                      width="15"
                      height="15"
                      className="__dumi-default-external-link-icon"
                    >
                      <path
                        fill="currentColor"
                        d="M18.8,85.1h56l0,0c2.2,0,4-1.8,4-4v-32h-8v28h-48v-48h28v-8h-32l0,0c-2.2,0-4,1.8-4,4v56C14.8,83.3,16.6,85.1,18.8,85.1z"
                      />
                      <polygon
                        fill="currentColor"
                        points="45.7,48.7 51.3,54.3 77.2,28.5 77.2,37.2 85.2,37.2 85.2,14.9 62.8,14.9 62.8,22.9 71.5,22.9"
                      />
                    </svg>
                  )}
                </a>
              )
            : undefined
        }
        {...props}
        {...(isExternal
          ? {}
          : {
              // scroll to top while change url
              onClick(...args) {
                window.scrollTo({
                  top: 0,
                });
                props.onClick?.apply(this, args);
              },
            })}
      />
    );
  };
};

export default LinkWrapper(Link);
