import React from 'react';
import { Box, HTMLCoralProps, css } from 'coral-system';
import { Breadcrumb } from 'antd';
import { observer, useWorkspace, useDesigner } from '@music163/tango-context';

const itemWrapperStyle = css`
  user-select: none;

  &:hover {
    color: var(--tango-colors-brand);
  }
`;

const ItemWrapper = (props: HTMLCoralProps<'div'>) => {
  return <Box display="inline-block" css={itemWrapperStyle} {...props} />;
};

export const BottomBar = observer(() => {
  const workspace = useWorkspace();
  const designer = useDesigner();

  if (workspace.selectSource.size !== 1) {
    return null;
  }

  const parents = workspace.selectSource?.first?.parents || [];
  const reversedParents = [...parents].reverse();
  const length = parents.length;

  return (
    <Box
      className="BottomBar"
      display={designer.isPreview ? 'none' : 'block'}
      flex="0"
      px="l"
      bg="background.normal"
      borderTop="solid"
      borderTopColor="line.normal"
    >
      <Breadcrumb>
        {reversedParents.map((parent, index) => (
          <Breadcrumb.Item
            key={parent.id}
            onClick={() => {
              workspace.selectSource.select({
                ...parent,
                parents: parents.slice(length - index),
              });
            }}
          >
            <ItemWrapper>{parent.name}</ItemWrapper>
          </Breadcrumb.Item>
        ))}
        <Breadcrumb.Item key={workspace.selectSource.first.id}>
          <ItemWrapper>{workspace.selectSource.first.name}</ItemWrapper>
        </Breadcrumb.Item>
      </Breadcrumb>
    </Box>
  );
});
