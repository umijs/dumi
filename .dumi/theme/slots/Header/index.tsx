import { ReactComponent as IconClose } from '@ant-design/icons-svg/inline-svg/outlined/close.svg';
import { ReactComponent as IconMenu } from '@ant-design/icons-svg/inline-svg/outlined/menu.svg';
import { Link, useRouteMeta, useSiteData } from 'dumi';
import ColorSwitch from 'dumi/theme/slots/ColorSwitch';
import HeaderExtra from 'dumi/theme/slots/HeaderExtra';
import LangSwitch from 'dumi/theme/slots/LangSwitch';
import Logo from 'dumi/theme/slots/Logo';
import Navbar from 'dumi/theme/slots/Navbar';
import RtlSwitch from 'dumi/theme/slots/RtlSwitch';
import SearchBar from 'dumi/theme/slots/SearchBar';
import SocialIcon from 'dumi/theme/slots/SocialIcon';
import React, { useMemo, useState, type FC } from 'react';
import './index.less';

const Header: FC = () => {
  const { frontmatter } = useRouteMeta();
  const [showMenu, setShowMenu] = useState(false);
  const { themeConfig } = useSiteData();

  const socialIcons = useMemo(() => {
    const socialLinks = themeConfig.socialLinks as
      | Record<string, string | undefined>
      | undefined;

    return socialLinks
      ? Object.keys(socialLinks)
          .slice(0, 5)
          .map((key) => ({
            icon: key,
            link: socialLinks[key],
          }))
          .filter((item): item is { icon: any; link: string } =>
            Boolean(item.link),
          )
      : [];
  }, [themeConfig.socialLinks]);

  return (
    <div
      className="dumi-default-header"
      data-static={Boolean(frontmatter.hero) || undefined}
      data-mobile-active={showMenu || undefined}
      data-site-banner
      onClick={() => setShowMenu(false)}
    >
      <div className="dumi-default-header-banner">
        <span>
          试试{' '}
          <span className="dumi-default-header-banner-bundler">
            Rust Bundler{' '}
          </span>
          <a
            href="https://github.com/utooland/utoo"
            target="_blank"
            rel="noreferrer"
          >
            utoopack
          </a>
          ，让 dumi 构建更快。
        </span>
        <Link to="/config#utoopack">了解更多</Link>
      </div>
      <div className="dumi-default-header-content">
        <section className="dumi-default-header-left">
          <Logo />
        </section>
        <section className="dumi-default-header-right">
          <Navbar />
          <div className="dumi-default-header-right-aside">
            <SearchBar />
            <LangSwitch />
            <RtlSwitch />
            {themeConfig.prefersColor.switch && <ColorSwitch />}
            {socialIcons.map((item) => (
              <SocialIcon icon={item.icon} link={item.link} key={item.link} />
            ))}
            <HeaderExtra />
          </div>
        </section>
        <button
          type="button"
          className="dumi-default-header-menu-btn"
          onClick={(ev) => {
            ev.stopPropagation();
            setShowMenu((v) => !v);
          }}
        >
          {showMenu ? <IconClose /> : <IconMenu />}
        </button>
      </div>
    </div>
  );
};

export default Header;
