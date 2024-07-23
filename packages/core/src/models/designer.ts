import { action, computed, makeObservable, observable, toJS } from 'mobx';
import { IWorkspace } from './interfaces';
import { MenuDataType } from '@music163/tango-helpers';
import { EditorState } from './editor-state';

export type SimulatorNameType = 'desktop' | 'phone';

export type DesignerViewType = 'design' | 'code' | 'dual';

interface ISimulatorType {
  name: SimulatorNameType;
  width: number;
  height: number;
}

interface IViewportBounding {
  width: number;
  height: number;
}

interface IDesignerOptions {
  editor: EditorState;
  workspace: IWorkspace;
  simulator?: SimulatorNameType | ISimulatorType;
  /**
   * 菜单配置
   */
  menuData: MenuDataType;
  activeSidebarPanel?: string;
  /**
   * 默认激活的视图模式
   */
  activeView?: DesignerViewType;
}

const ISimulatorTypes: Record<string, ISimulatorType> = {
  desktop: {
    name: 'desktop',
    width: 1366,
    height: 800,
  },
  phone: {
    name: 'phone',
    width: 375,
    height: 812,
  },
};

export class Designer {
  /**
   * 当前的沙箱模拟器类型
   */
  _simulator: ISimulatorType = ISimulatorTypes.desktop;

  /**
   * 当前的视图尺寸
   */
  _viewport: IViewportBounding = {
    width: 1366,
    height: 800,
  };

  /**
   * 当前激活的视图
   */
  _activeView: DesignerViewType = 'design';

  /**
   * 当前选中的侧边栏面板
   */
  _activeSidebarPanel = '';

  /**
   * 是否显示智能引导
   */
  _showSmartWizard = false;

  /**
   * 是否显示添加组件面板
   */
  _showAddComponentPopover = false;

  /**
   * 添加组件面板的位置
   */
  _addComponentPopoverPosition = { clientX: 0, clientY: 0 };

  /**
   * 是否显示右键菜单
   */
  _showContextMenu = false;

  /**
   * 右键菜单在 iframe 上的位置
   */
  _contextMenuPosition = { clientX: 0, clientY: 0 };

  /**
   * 是否显示右侧面板
   */
  _showRightPanel = true;

  /**
   * 是否预览模式
   */
  _isPreview = false;

  /**
   * 菜单列表
   */
  _menuData?: MenuDataType = null;

  private readonly workspace: IWorkspace;

  private readonly editor: EditorState;

  get simulator(): ISimulatorType {
    return toJS(this._simulator);
  }

  get viewport() {
    return toJS(this._viewport);
  }

  get activeView() {
    return this._activeView;
  }

  get isPreview() {
    return this._isPreview;
  }

  get showSmartWizard() {
    return this._showSmartWizard;
  }

  get activeSidebarPanel() {
    return this._activeSidebarPanel;
  }

  get showRightPanel() {
    return this._showRightPanel;
  }

  get showAddComponentPopover() {
    return this._showAddComponentPopover;
  }

  get addComponentPopoverPosition() {
    return this._addComponentPopoverPosition;
  }

  get showContextMenu() {
    return this._showContextMenu;
  }

  get contextMenuPosition() {
    return this._contextMenuPosition;
  }

  get menuData() {
    return this._menuData ?? ([] as MenuDataType);
  }

  constructor(options: IDesignerOptions) {
    this.workspace = options.workspace;
    this.editor = options.editor;

    const {
      simulator,
      menuData,
      activeSidebarPanel: defaultActiveSidebarPanel,
      activeView: defaultActiveView,
    } = options;

    if (menuData) {
      this.setMenuData(menuData);
    }

    // 默认设计器模式
    if (simulator) {
      this.setSimulator(simulator);
    }

    // 默认展开的侧边栏
    if (defaultActiveSidebarPanel) {
      this.setActiveSidebarPanel(defaultActiveSidebarPanel);
    }

    // 默认激活的视图
    if (defaultActiveView) {
      this.setActiveView(defaultActiveView);
    }

    makeObservable(this, {
      _simulator: observable,
      _viewport: observable,
      _activeView: observable,
      _activeSidebarPanel: observable,
      _showSmartWizard: observable,
      _showRightPanel: observable,
      _showAddComponentPopover: observable,
      _addComponentPopoverPosition: observable,
      _showContextMenu: observable,
      _contextMenuPosition: observable,
      _menuData: observable,
      _isPreview: observable,
      simulator: computed,
      viewport: computed,
      activeView: computed,
      activeSidebarPanel: computed,
      isPreview: computed,
      showRightPanel: computed,
      showSmartWizard: computed,
      showAddComponentPopover: computed,
      addComponentPopoverPosition: computed,
      showContextMenu: computed,
      contextMenuPosition: computed,
      menuData: computed,
      setSimulator: action,
      setViewport: action,
      setActiveView: action,
      setActiveSidebarPanel: action,
      closeSidebarPanel: action,
      toggleRightPanel: action,
      toggleSmartWizard: action,
      toggleIsPreview: action,
      toggleAddComponentPopover: action,
      toggleContextMenu: action,
    });
  }

  setSimulator(value: ISimulatorType | SimulatorNameType) {
    if (typeof value === 'string') {
      this._simulator = ISimulatorTypes[value];
    } else {
      this._simulator = value;
    }
  }

  setViewport(value: IViewportBounding) {
    this._viewport = value;
  }

  setActiveView(view: DesignerViewType) {
    const prevView = this._activeView;
    if (view === prevView) {
      return;
    }

    const editor2workspace = () => {
      this.workspace.clearFiles();
      this.workspace.addFiles(this.editor.listFileData());
    };
    const workspace2editor = () => {
      this.editor.clear();
      this.editor.addFiles(this.workspace.listFileData());
    };
    if (view === 'dual') {
      this.setActiveSidebarPanel('');
      this.toggleRightPanel(false);
      this.toggleIsPreview(true);
      workspace2editor();
    } else if (view === 'design') {
      this.toggleIsPreview(false);
      editor2workspace();
    } else if (view === 'code') {
      workspace2editor();
    }

    this._activeView = view;
  }

  setActiveSidebarPanel(panel: string) {
    if (panel && panel !== this.activeSidebarPanel) {
      this._activeSidebarPanel = panel;
    } else {
      this._activeSidebarPanel = '';
    }
  }

  setMenuData(menuData: MenuDataType) {
    this._menuData = menuData;
  }

  closeSidebarPanel() {
    this._activeSidebarPanel = '';
  }

  toggleSmartWizard(value: boolean) {
    this._showSmartWizard = value;
  }

  toggleRightPanel(value?: boolean) {
    this._showRightPanel = value ?? !this._showRightPanel;
  }

  /**
   * 显示添加组件面板
   * @param value 是否显示
   * @param position 坐标
   */
  toggleAddComponentPopover(
    value: boolean,
    position: {
      clientX: number;
      clientY: number;
    } = this.addComponentPopoverPosition,
  ) {
    this._showAddComponentPopover = value;
    this._addComponentPopoverPosition = position;
  }

  toggleIsPreview(value: boolean) {
    this._isPreview = value ?? !this._isPreview;
    if (value) {
      this.workspace.selectSource.clear();
    }
  }

  toggleContextMenu(
    value: boolean,
    position: {
      clientX: number;
      clientY: number;
    } = this.contextMenuPosition,
  ) {
    this._showContextMenu = value;
    this._contextMenuPosition = position;
  }
}
