/* eslint-disable @typescript-eslint/no-use-before-define */
import { ReactComponent as IconDown } from '@ant-design/icons-svg/inline-svg/outlined/down.svg';
import { Link, useLocation, useNavData } from 'dumi';
import NavbarExtra from 'dumi/theme/slots/NavbarExtra';
import React, { useState, type FC } from 'react';
import './index.less';

const NavbarItem: FC<{ data: ReturnType<typeof useNavData>[0] }> = ({
  data,
}) => {
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return data.children?.some((item) => {
      const activePath = item.activePath || item.link;

      return activePath && pathname.startsWith(activePath);
    });
  });
  const CollapsedBtn = data.children && (
    <button
      className="dumi-default-navbar-collapse-btn"
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setIsCollapsed((v) => !v);
      }}
      data-collapsed={isCollapsed || undefined}
    >
      <IconDown />
    </button>
  );
  const NestedNav = data.children && (
    <ul
      className="dumi-default-navbar-dropdown"
      data-collapsed={isCollapsed || undefined}
    >
      <NavbarContent data={data.children} />
    </ul>
  );
  // user custom nav has no activePath, so fallback to link
  const activePath = data.activePath || data.link;
  const extraProps =
    activePath && pathname.startsWith(activePath)
      ? { className: 'active' }
      : {};

  return data.link ? (
    <>
      <Link to={data.link} {...extraProps}>
        {data.title}
      </Link>
      {CollapsedBtn}
      {NestedNav}
    </>
  ) : (
    <>
      <span
        onClick={(e) => {
          e.stopPropagation();
          setIsCollapsed((v) => !v);
        }}
        {...extraProps}
      >
        {data.title}
      </span>
      {CollapsedBtn}
      {NestedNav}
    </>
  );
};

const NavbarContent: FC<{ data: ReturnType<typeof useNavData> }> = ({
  data,
}) => {
  return (
    <>
      {data.map((item) => (
        <li key={item.activePath || item.link || item.title}>
          {item.link && /^(\w+:)\/\/|^(mailto|tel):/.test(item.link) ? (
            <a href={item.link} target="_blank" rel="noreferrer">
              {item.title}
            </a>
          ) : (
            <NavbarItem data={item} />
          )}
        </li>
      ))}
    </>
  );
};

const Navbar: FC = () => {
  const nav = useNavData();

  return (
    <ul className="dumi-default-navbar">
      <NavbarContent data={nav} />
      <NavbarExtra />
    </ul>
  );
};

export default Navbar;
