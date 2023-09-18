import React, { useMemo } from 'react';
import cx from 'classnames';
import { css, Box, Text, HTMLCoralProps } from 'coral-system';
import { merge } from '@music163/tango-helpers';

export interface PanelProps extends Omit<HTMLCoralProps<'div'>, 'title'> {
  /**
   * 面板标题
   */
  title?: React.ReactNode;
  /**
   * 小标题
   */
  subTitle?: React.ReactNode;
  /**
   * 标题栏附加节点
   */
  extra?: React.ReactNode;
  /**
   * 面板外观
   */
  shape?: 'solid' | 'light';
  headerProps?: HTMLCoralProps<'div'>;
  bodyProps?: HTMLCoralProps<'div'>;
}

const headerStyle = css`
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export function Panel({
  shape = 'light',
  title,
  subTitle: subTitleProp,
  extra,
  headerProps: headerPropsProp,
  bodyProps: bodyPropsProp,
  children,
  className,
  ...rest
}: PanelProps) {
  const systemProps = useMemo(() => {
    let rootProps: HTMLCoralProps<'div'>;
    let headerProps: HTMLCoralProps<'div'>;
    let bodyProps: HTMLCoralProps<'div'>;

    if (shape === 'solid') {
      rootProps = {
        border: 'solid',
        borderColor: 'line.normal',
      };
      headerProps = {
        borderBottom: 'solid',
        borderBottomColor: 'line.normal',
        p: 'm',
        lineHeight: '24px',
      };
      bodyProps = {
        p: 'm',
      };
    }

    return {
      rootProps,
      headerProps: merge(headerProps, headerPropsProp),
      bodyProps: merge(bodyProps, bodyPropsProp),
    };
  }, [shape, headerPropsProp, bodyPropsProp]);

  const subTitle =
    typeof subTitleProp === 'string' && subTitleProp ? (
      <Text ml="m" fontSize="note">
        {subTitleProp}
      </Text>
    ) : (
      subTitleProp
    );

  const showHeader = !!(title || subTitle || extra);

  return (
    <Box
      display="flex"
      flexDirection="column"
      overflow="auto"
      bg="white"
      {...systemProps.rootProps}
      className={cx('Panel', className)}
      {...rest}
    >
      {showHeader && (
        <Box
          flex="0"
          px="m"
          py="s"
          {...systemProps.headerProps}
          css={headerStyle}
          className="PanelHeader"
        >
          <Box>
            <Text color="text.title" fontWeight="500">
              {title}
            </Text>
            {subTitle && <Text ml="s">{subTitle}</Text>}
          </Box>
          {extra}
        </Box>
      )}
      <Box flex="1" overflowY="auto" {...systemProps.bodyProps} className="PanelBody">
        {children}
      </Box>
    </Box>
  );
}
