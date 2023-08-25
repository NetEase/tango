import React from 'react';
import { Box, css, Group } from 'coral-system';
import { IconButton, ToggleButton } from '@music163/tango-ui';
import { observer, useDesigner } from '@music163/tango-context';
import { Input } from 'antd';
import {
  DesktopOutlined,
  MobileOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';

const navigatorStyle = css`
  display: flex;
  column-gap: 12px;

  .navigatorInput {
    flex: 1;
  }
`;

interface NavigatorProps {
  disabled?: boolean;
  startRoute?: string;
  onBack?: () => void;
  onForward?: () => void;
  onRefresh?: () => void;
  onInputEnter?: (text: string, e: React.KeyboardEvent<HTMLInputElement>) => void;
}

interface NavigatorState {
  relativeUrl: string;
}

export class Navigator extends React.Component<NavigatorProps, NavigatorState> {
  constructor(props: NavigatorProps) {
    super(props);
    this.state = {
      relativeUrl: props.startRoute || '/',
    };
  }

  componentDidUpdate(prevProps: Readonly<NavigatorProps>, prevState: Readonly<NavigatorState>) {
    if (
      this.props.startRoute &&
      prevProps.startRoute !== this.props.startRoute &&
      this.props.startRoute !== prevState.relativeUrl
    ) {
      this.setState({
        relativeUrl: this.props.startRoute,
      });
    }
  }

  changeRelativeUrl = (newUrl: string) => {
    if (newUrl !== this.state.relativeUrl) {
      this.setState({
        relativeUrl: newUrl,
      });
    }
  };

  render() {
    const { disabled, onBack, onForward, onRefresh } = this.props;
    return (
      <Box
        className="navigator"
        bg="white"
        px="l"
        py="4px"
        borderBottom="solid"
        borderBottomColor="line.normal"
        css={navigatorStyle}
      >
        <Box>
          <IconButton icon={<ArrowLeftOutlined />} onClick={onBack} title="返回" />
          <IconButton icon={<ArrowRightOutlined />} onClick={onForward} title="前进" />
          <IconButton icon={<ReloadOutlined />} onClick={onRefresh} title="刷新" />
        </Box>
        <Input
          className="navigatorInput"
          size="small"
          value={this.state.relativeUrl}
          onChange={this.onInputChange}
          onPressEnter={this.onPressEnter}
          disabled={disabled}
        />
        <ViewportSwitch />
      </Box>
    );
  }

  private onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const path = e.target.value.startsWith('/') ? e.target.value : `/${e.target.value}`;
    this.changeRelativeUrl(path);
  };

  private onPressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const newUrl = e.currentTarget.value;
    this.props.onInputEnter?.(newUrl, e);
  };
}

const ViewportSwitch = observer(() => {
  const designer = useDesigner();
  return (
    <Group attached>
      <ToggleButton
        size="s"
        selected={designer.simulator.name === 'desktop'}
        onClick={() => {
          designer.setSimulator('desktop');
        }}
      >
        <DesktopOutlined />
      </ToggleButton>
      <ToggleButton
        size="s"
        selected={designer.simulator.name === 'phone'}
        onClick={() => {
          designer.setSimulator('phone');
        }}
      >
        <MobileOutlined />
      </ToggleButton>
    </Group>
  );
});
