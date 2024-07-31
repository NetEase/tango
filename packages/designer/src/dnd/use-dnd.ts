import React, { useEffect, useMemo } from 'react';
import { DropMethod, FileType, Designer, AbstractCodeWorkspace } from '@music163/tango-core';
import { ISelectedItemData, events, getHotkey } from '@music163/tango-helpers';
import {
  setElementStyle,
  getElementCSSDisplay,
  distanceToRect,
  getDragGhostElement,
} from '../helpers';
import { DndQuery, DRAGGABLE_SELECTOR } from '.';
import { Hotkey } from './hotkey';
import { SelectModeType } from '../types';

interface UseDndProps {
  workspace: AbstractCodeWorkspace;
  designer: Designer;
  /**
   * 沙箱内的 DOM 查询操作
   */
  sandboxQuery: DndQuery;
  /**
   * 选择模式
   * - point 点选
   * - area 框选
   */
  selectMode?: SelectModeType;
  /**
   * 沙箱视图变化时的回调
   * @param data
   */
  onViewChange?: (data: any) => void;
}

export function useDnd({
  sandboxQuery,
  designer,
  workspace,
  selectMode = 'point',
  onViewChange,
}: UseDndProps) {
  const selectSource = workspace.selectSource;

  useEffect(() => {
    workspace.ready();
  }, [workspace]);

  const hotkey = useMemo(() => {
    return new Hotkey({
      esc: () => {
        workspace.selectSource.clear();
      },
      'del,backspace': () => {
        workspace.removeSelectedNode();
      },
      'command+c,ctrl+c': () => {
        workspace.copySelectedNode();
      },
      'command+v,ctrl+v': () => {
        workspace.pasteSelectedNode();
      },
      'command+arrowup,ctrl+arrowup': () => {
        workspace.selectSource.selectParent();
      },
      'command+z,ctrl+z': () => {
        workspace.history.back();
      },
      'command+shift+z,ctrl+shift+z': () => {
        workspace.history.forward();
      },
    });
  }, [workspace]);

  let moveListener: any;
  let upListener: any;

  const onMouseDown = (e: React.MouseEvent) => {
    if (designer.isPreview) {
      return;
    }
    if (designer.showContextMenu) {
      designer.toggleContextMenu(false);
    }

    const point = sandboxQuery.getRelativePoint({ x: e.clientX, y: e.clientY });
    selectSource.setStart({
      point,
      element: e.target as HTMLElement,
    });

    const watchElement = sandboxQuery.context || sandboxQuery.container;

    moveListener = events.on(watchElement, 'mousemove', onMouseMove);
    upListener = events.on(watchElement, 'mouseup', onMouseUp);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const point = sandboxQuery.getRelativePoint({ x: e.clientX, y: e.clientY });
    setElementStyle('.SelectionMask', {
      width: `${Math.abs(selectSource.start?.point.x - point.x)}px`,
      height: `${Math.abs(selectSource.start?.point.y - point.y)}px`,
      left: `${Math.min(selectSource.start?.point.x, point.x)}px`,
      top: `${Math.min(selectSource.start?.point.y, point.y)}px`,
    });
  };

  const onMouseUp = (e: React.MouseEvent) => {
    moveListener?.off();
    upListener?.off();
    const point = sandboxQuery.getRelativePoint({ x: e.clientX, y: e.clientY });
    if (point.x === selectSource.start?.point.x && point.y === selectSource.start?.point.y) {
      // select current
      const data = sandboxQuery.getDraggableParentsData(e.target as HTMLElement, true);
      if (data && data.id) {
        selectSource.select(data);
      }
    } else {
      // select area
      setElementStyle('.SelectionMask', {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
      });
      const targets = sandboxQuery.getDraggableElementsDataByArea(
        selectSource.start.element,
        selectSource.start.point,
        point,
      );
      selectSource.select(targets);
    }
  };

  const onClick = (e: React.MouseEvent) => {
    if (designer.showContextMenu) {
      designer.toggleContextMenu(false);
    }
    const data = sandboxQuery.getDraggableParentsData(e.target as HTMLElement, true);
    if (data && data.id) {
      selectSource.select(data);
      // 画布选中节点时，自动唤起 right-panel
      designer.toggleRightPanel(true);
    }
  };

  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    const dragSourceData = sandboxQuery.getDraggableParentsData(e.target as HTMLElement, false);
    if (!dragSourceData || !dragSourceData.name) {
      // 如果没有找到可拖拽元素，直接退出
      return;
    }

    const prototype = workspace.componentPrototypes.get(dragSourceData.name);
    if (!prototype) {
      return;
    }

    const { canDrag } = prototype.rules || {};
    if (canDrag && !canDrag()) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    workspace.dragSource.set(dragSourceData);

    const ghost = getDragGhostElement();
    e.dataTransfer.setDragImage(ghost, 0, 0);
  };

  const onDragEnd = () => {
    workspace.dragSource.clear();
  };

  let latestEnterId: string;

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (
      !workspace.dragSource.prototype || // 没有原型
      !workspace.dragSource.dropTarget.id || // 没有明确的着陆点
      workspace.dragSource.id === workspace.dragSource.dropTarget.id || // 着陆点为自己
      sandboxQuery.isChildOfElement(workspace.dragSource.id, workspace.dragSource.dropTarget.id) // 自己是着陆点的父元素
    ) {
      return;
    }

    workspace.dropNode();
    latestEnterId = undefined;
    moveListener?.off();
    upListener?.off();
  };

  const onDragEnter = (e: React.DragEvent<HTMLElement>) => {
    if (!workspace.dragSource.data) {
      return;
    }

    const closetDropTargetData = sandboxQuery.getDraggableParentsData(
      e.target as HTMLElement,
      false,
    );
    if (!closetDropTargetData || !closetDropTargetData.id) {
      return;
    }

    // 不重复触发次逻辑
    if (latestEnterId === closetDropTargetData.id) {
      return;
    }

    // 记录上次进入的区域 ID
    latestEnterId = closetDropTargetData.id;

    const closetDropTargetElement = closetDropTargetData.element;
    const closetDropTargetBounding = closetDropTargetData.bounding;
    const closetDropTargetDisplay = getElementCSSDisplay(closetDropTargetElement);
    const closetDropTargetPrototype = workspace.componentPrototypes.get(closetDropTargetData.name);

    // 如果探测的最近着陆点为拖拽的元素自己的话，则跳过检测
    if (closetDropTargetData.id === workspace.dragSource.id) {
      return;
    }

    if (!closetDropTargetPrototype) {
      return;
    }

    // 校验结点的拖拽规则
    if (closetDropTargetPrototype.rules) {
      const { canMoveIn } = closetDropTargetPrototype.rules;
      if (canMoveIn && !canMoveIn(workspace.dragSource.name)) {
        return;
      }
    }

    let nextState: ISelectedItemData;
    let nextMethod: DropMethod;

    if (closetDropTargetPrototype.type === 'placeholder') {
      nextState = closetDropTargetData;
      nextMethod = DropMethod.ReplaceNode;
    } else if (closetDropTargetPrototype.hasChildren) {
      let descendantSelector = DRAGGABLE_SELECTOR;
      if (closetDropTargetPrototype.rules?.childrenContainerSelector) {
        descendantSelector = `${closetDropTargetPrototype.rules?.childrenContainerSelector} ${DRAGGABLE_SELECTOR}`;
      }
      const children = sandboxQuery.getDraggableDescendants(
        closetDropTargetElement,
        descendantSelector,
      );

      if (children.length) {
        // 容器组件中有子组件，定位到与当前位置最近的子元素，插入位置为该子元素的尾部
        let closetChildElement;
        let closetDistance;
        for (let i = 0; i < children.length; i++) {
          const distance = distanceToRect(e, children[i].getBoundingClientRect());
          if (!closetDistance || distance < closetDistance) {
            closetDistance = distance;
            closetChildElement = children[i];
          }
        }
        const closetChildElementData = sandboxQuery.getElementData(closetChildElement);

        if (!closetChildElementData.id || !closetChildElementData.name) {
          // 如果子元素没有特定的属性，直接提前结束
          return;
        }

        const closetChildElementBounding = closetChildElementData.bounding;
        const closetChildElementDisplay = getElementCSSDisplay(closetChildElement);

        nextState = closetChildElementData;

        switch (closetChildElementDisplay) {
          case 'inline':
          case 'inline-block':
          case 'inline-flex':
          case 'inline-grid': {
            // 行内元素
            if (e.pageX < closetChildElementBounding.left + closetChildElementBounding.width / 2) {
              nextMethod = DropMethod.InsertBefore;
            } else {
              nextMethod = DropMethod.InsertAfter;
            }
            break;
          }
          default: {
            // 块级元素
            if (e.pageY < closetChildElementBounding.top + closetChildElementBounding.height / 2) {
              nextMethod = DropMethod.InsertBefore;
            } else {
              nextMethod = DropMethod.InsertAfter;
            }
            break;
          }
        }
      } else {
        // 没有孩子节点的容器节点
        nextState = closetDropTargetData;
        nextMethod = DropMethod.InsertChild;
      }
    } else {
      // dropTarget is not a container
      nextState = closetDropTargetData;

      switch (closetDropTargetDisplay) {
        case 'inline':
        case 'inline-block':
        case 'inline-flex':
        case 'inline-grid':
        case 'table-cell': {
          // 行内元素
          if (
            closetDropTargetBounding.left < e.pageX &&
            e.pageX < closetDropTargetBounding.left + closetDropTargetBounding.width / 2
          ) {
            nextMethod = DropMethod.InsertBefore;
          } else if (
            closetDropTargetBounding.left + closetDropTargetBounding.width / 2 < e.pageX &&
            e.pageX < closetDropTargetBounding.left + closetDropTargetBounding.width
          ) {
            nextMethod = DropMethod.InsertAfter;
          }
          break;
        }
        default: {
          // 块级元素
          if (
            closetDropTargetBounding.top < e.pageY &&
            e.pageY < closetDropTargetBounding.top + closetDropTargetBounding.height / 2
          ) {
            nextMethod = DropMethod.InsertBefore;
          } else {
            nextMethod = DropMethod.InsertAfter;
          }
          break;
        }
      }
    }

    const closetDropTargetNode = workspace.getNode(nextState.id);

    // 区块不能拖拽到区块中
    if (
      workspace.dragSource.prototype.type === 'block' &&
      closetDropTargetNode.file.type === FileType.BlockEntryModule
    ) {
      return;
    }

    if (nextState) {
      // 更新拖拽放置的目标元素
      workspace.dragSource.dropTarget.set(nextState, nextMethod);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  let timer = 0;
  // 目前只有 iframe 的沙箱需要监听
  const onScroll = () => {
    if (!sandboxQuery.context) {
      return;
    }

    if (selectSource.isSelected) {
      if (timer) {
        cancelAnimationFrame(timer);
      }
      // TIP: 这里根据沙箱的滚动去修正选中框的位置
      timer = requestAnimationFrame(() => {
        // 重新获取选中元素的外观数据
        selectSource.selected.forEach((item) => {
          if (item.element) {
            const bounding = sandboxQuery.getElementBounding(item.element);
            setElementStyle(`[data-selection-id="${item.id}"]`, {
              transform: `translate(${bounding.left}px, ${bounding.top}px)`,
            });
          }
        });
      });
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const isInputElement = target.isContentEditable || isInputElements(target.nodeName);
    // 禁用输入事件的触发的快捷键逻辑
    if (!isInputElement) {
      const key = getHotkey(e);
      hotkey.run(key);
    }
  };

  const onContextMenu = (event: React.MouseEvent) => {
    if (designer.showContextMenu) {
      designer.toggleContextMenu(false);
    }
    // 按下其他按键时，视为用户有特殊操作，此时不展示右键菜单
    if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
      return;
    }
    const { clientX, clientY } = event;
    let target;
    if (workspace.selectSource.isSelected) {
      for (const item of workspace.selectSource.selected) {
        if (
          // 如果选中的节点是页面根节点（无 parents），则忽略
          item.parents?.length &&
          item.bounding &&
          clientX >= item.bounding.left &&
          clientX <= item.bounding.left + item.bounding.width &&
          clientY >= item.bounding.top &&
          clientY <= item.bounding.top + item.bounding.height
        ) {
          // 右键坐标已经在当前选中组件的选区内，直接展示右键菜单
          target = item;
          break;
        }
      }
    }
    // 否则，根据右键的元素选中最接近的组件
    if (!target) {
      target = sandboxQuery.getDraggableParentsData(event.target as HTMLElement, true);
    }
    if (target && target.id) {
      if (!target.parents?.length) {
        // 页面根节点不展示右键菜单操作
        return;
      }
      // 右键时高亮选中当前元素
      // 以防之前选区有多个元素，即便已经是选中的元素也再选中一遍
      event.preventDefault();
      selectSource.select(target);
      // 在下一周期再展示右键菜单，以让先前的菜单先被销毁
      requestAnimationFrame(() => {
        designer.toggleContextMenu(true, {
          clientX,
          clientY,
        });
      });
    }
  };

  const onTango = (e: CustomEvent) => {
    const detail = e.detail || {};

    switch (detail.type) {
      case 'insertChild':
        workspace.insertToNode(detail.targetId, detail.sourceName);
        break;
      case 'replaceNode':
        workspace.replaceNode(detail.targetId, detail.sourceName);
        break;
      case 'viewChange':
        // FIXME: 内部路由跳转，更新 activeRoute 等信息，有风险，先去掉
        //   const location = detail.data || {};
        //   workspace.setActiveRoute(location.pathname + location.search);
        onViewChange?.(detail.data);
        break;
      case 'openSmartWizard':
        // 修正 selectSource
        if (detail.targetId !== selectSource.first?.id) {
          const element = sandboxQuery.getElementBySlotId(detail.targetId);
          const elementData = sandboxQuery.getElementData(element);
          selectSource.select(elementData);
        }

        // 打开智能向导弹窗
        designer.toggleSmartWizard(true);
        break;
      case 'addComponent':
        // 打开添加组件面板
        designer.toggleAddComponentPopover(true, {
          clientX: (e.detail.meta as any).clientX + 40,
          clientY: (e.detail.meta as any).clientY + 110,
        });
        break;
      default:
        break;
    }
  };

  const selectHandler = selectMode === 'point' ? { onClick } : { onMouseDown };

  return {
    onDragStart,
    onDragEnter,
    onDragOver,
    onDrop,
    onDragEnd,
    onScroll,
    onKeyDown,
    onContextMenu,
    onTango,
    ...selectHandler,
  };
}

const inputElements = ['input', 'textarea', 'text'];

function isInputElements(elementType: string) {
  if (inputElements.includes(elementType?.toLowerCase())) {
    return true;
  }
  return false;
}
