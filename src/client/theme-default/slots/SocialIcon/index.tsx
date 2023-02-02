import { SocialTypes } from '@/client/theme-api/types';
import { ReactComponent as IconFacebook } from '@ant-design/icons-svg/inline-svg/outlined/facebook.svg';
import { ReactComponent as IconGitHub } from '@ant-design/icons-svg/inline-svg/outlined/github.svg';
import { ReactComponent as IconGitlab } from '@ant-design/icons-svg/inline-svg/outlined/gitlab.svg';
import { ReactComponent as IconLinkedin } from '@ant-design/icons-svg/inline-svg/outlined/linkedin.svg';
import { ReactComponent as IconTwitter } from '@ant-design/icons-svg/inline-svg/outlined/twitter.svg';
import { ReactComponent as IconWeiBo } from '@ant-design/icons-svg/inline-svg/outlined/weibo.svg';
import { ReactComponent as IconYuque } from '@ant-design/icons-svg/inline-svg/outlined/yuque.svg';
import { ReactComponent as IconZhihu } from '@ant-design/icons-svg/inline-svg/outlined/zhihu.svg';
import React, { FunctionComponent, useMemo, type FC } from 'react';
import { useIntl } from 'react-intl';
import './index.less';

export type SocialIconProps = {
  icon: SocialTypes;
  link: string;
};

export type PresetSocialIcon = {
  Icon: FunctionComponent;
  titleIntlId: string;
};

const presetIconMap: Record<SocialTypes, FunctionComponent> = {
  github: IconGitHub,
  weibo: IconWeiBo,
  twitter: IconTwitter,
  gitlab: IconGitlab,
  facebook: IconFacebook,
  zhihu: IconZhihu,
  yuque: IconYuque,
  linkedin: IconLinkedin,
};

const SocialIcon: FC<SocialIconProps> = (props: SocialIconProps) => {
  const { icon, link } = props;

  const intl = useIntl();

  const preset = useMemo(
    () => ({ Icon: presetIconMap[icon], link }),
    [icon, link],
  );

  return (
    <a
      className="dumi-default-icon"
      data-dumi-tooltip={intl.formatMessage({
        id: `header.social.${icon}`,
      })}
      data-dumi-tooltip-bottom
      target="_blank"
      href={preset.link}
      rel="noreferrer"
    >
      <preset.Icon />
    </a>
  );
};

export default SocialIcon;
