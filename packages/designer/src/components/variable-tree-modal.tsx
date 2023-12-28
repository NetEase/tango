import React, { useState } from 'react';
import { ModalProps, Modal } from 'antd';
import { Box } from 'coral-system';
import { noop, useBoolean } from '@music163/tango-helpers';
import { VariableTree, VariableTreeProps } from './variable-tree';
import { IVariableTreeNode } from '../types';

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
