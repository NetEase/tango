import React, { useMemo } from 'react';
import cx from 'classnames';
import { Box, css } from 'coral-system';
import { format } from 'date-fns';
import { observer, useWorkspace } from '@music163/tango-context';

export const HistoryView = observer(() => {
  const workspace = useWorkspace();
  const history = workspace.history;

  return (
    <Box as="ul" p="0" m="0">
      {history.list.map((item, index) => (
        <HistoryItem
          key={item.time}
          data={item}
          className={cx({ active: history.index === index })}
        />
      ))}
    </Box>
  );
});

const itemStyle = css`
  line-height: 2.5;
  cursor: pointer;
  user-select: none;

  &:hover {
    background-color: var(--tango-colors-gray-10);
  }

  &.active {
    color: var(--tango-colors-brand);
  }
`;

function HistoryItem({ data, ...rest }: any) {
  const { time, message } = data;
  const formatTime = useMemo(() => {
    return format(time, 'yyyy/MM/dd HH:mm:mm');
  }, [time]);
  return (
    <Box as="li" display="flex" justifyContent="space-between" px="m" css={itemStyle} {...rest}>
      <Box>{message}</Box>
      <Box>{formatTime}</Box>
    </Box>
  );
}
