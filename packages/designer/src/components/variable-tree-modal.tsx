import React, { useState } from 'react';
import { ModalProps, Modal } from 'antd';
import { Box } from 'coral-system';
import { noop, useBoolean } from '@music163/tango-helpers';
import { VariableTree, VariableTreeProps } from './variable-tree';

export interface IVariableTreeNode {
  /**
   * 唯一标识符
   */
  key: string;
  /**
   * 标题
   */
  title?: string;
  /**
   * 是否可选中
   */
  selectable?: boolean;
  /**
   * 结点类型，用来展示图标
   */
  type?: 'function' | 'property';
  /**
   * 定义的原始值
   */
  raw?: any;
  /**
   * 子结点
   */
  children?: IVariableTreeNode[];
  [key: string]: any;
}

interface VariableTreeModalProps extends VariableTreeProps {
  trigger?: React.ReactElement;
  title?: ModalProps['title'];
  modalProps?: ModalProps;
}

export function VariableTreeModal({
  trigger,
  title,
  modalProps,
  onSelect = noop,
  ...rest
}: VariableTreeModalProps) {
  const [node, setNode] = useState<IVariableTreeNode>();
  const [visible, { on, off }] = useBoolean(false);
  return (
    <Box>
      {React.cloneElement(trigger, { onClick: on })}
      <Modal
        title={title}
        open={visible}
        onCancel={off}
        okButtonProps={{
          disabled: !node,
        }}
        onOk={() => {
          if (node) {
            onSelect(node);
            off();
          }
        }}
        width="60%"
        {...modalProps}
      >
        <VariableTree height={400} onSelect={setNode} {...rest} />
      </Modal>
    </Box>
  );
}
