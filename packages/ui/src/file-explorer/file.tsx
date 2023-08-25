import React from 'react';
import { css } from 'styled-components';
import { Box } from 'coral-system';
import { FolderOpenOutlined, FolderOutlined, FileOutlined } from '@ant-design/icons';

export interface Props {
  path: string;
  selectFile?: (path: string) => void;
  active?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  depth: number;
  isDirOpen?: boolean;
}

const fileItemStyle = css`
  user-select: none;
  transition: all 0.15s ease-in-out;

  > .anticon {
    margin-right: 4px;
  }

  &:hover {
    background-color: var(--tango-colors-gray-10);
  }

  &[data-active='true'] {
    background-color: var(--tango-colors-gray-30);
  }
`;

export class File extends React.PureComponent<Props> {
  selectFile = () => {
    if (this.props.selectFile) {
      this.props.selectFile(this.props.path);
    }
  };

  render() {
    const fileName = this.props.path.split('/').filter(Boolean).pop();

    return (
      <Box
        as="li"
        data-active={this.props.active}
        onClick={this.props.selectFile ? this.selectFile : (this.props.onClick as any)}
        display="flex"
        alignItems="center"
        height="28px"
        py="4px"
        pr="12px"
        pl={16 * this.props.depth}
        css={fileItemStyle}
      >
        {this.props.selectFile ? <FileOutlined /> : <DirectoryIcon isOpen={this.props.isDirOpen} />}
        {fileName}
      </Box>
    );
  }
}

function DirectoryIcon({ isOpen }: { isOpen?: Props['isDirOpen'] }) {
  return isOpen ? <FolderOpenOutlined /> : <FolderOutlined />;
}
