import React from 'react';
import CommonSectionCard from './CommonSectionCard';

function CommonFormCard({ title, subtitle, children, sx, ...props }) {
  return (
    <CommonSectionCard title={title} subtitle={subtitle} divider={Boolean(title || subtitle)} sx={sx} {...props}>
      {children}
    </CommonSectionCard>
  );
}

export default CommonFormCard;
