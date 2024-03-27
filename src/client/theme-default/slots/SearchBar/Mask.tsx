import React, { useEffect, type FC, type ReactNode } from 'react';

type MaskProps = {
  visible: boolean;
  children: ReactNode;
  onMaskClick?: () => void;
  onClose?: () => void;
};

export const Mask: FC<MaskProps> = (props) => {
  useEffect(() => {
    if (props.visible) {
      document.body.style.overflow = 'hidden';
    } else if (document.body.style.overflow) {
      document.body.style.overflow = '';
      props.onClose?.();
    }
  }, [props.visible]);

  return props.visible ? (
    <div className="dumi-default-search-modal">
      <div
        className="dumi-default-search-modal-mask"
        onClick={props.onMaskClick}
      />
      <div className="dumi-default-search-modal-content">{props.children}</div>
    </div>
  ) : null;
};
