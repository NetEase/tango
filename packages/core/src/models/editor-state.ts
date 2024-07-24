import { action, computed, makeObservable, observable } from 'mobx';
import { FileType, IFileConfig } from '../types';

interface EditorActionPayload {
  filename: string;
  newFilename?: string;
  code: string;
  type?: FileType;
}

type AddFilePayload = Omit<EditorActionPayload, 'newFileName'>;
type DeleteFilePayload = Pick<EditorActionPayload, 'filename'>;
type RenameFilePayload = Pick<EditorActionPayload, 'filename' | 'newFilename'>;
type UpdateFilePayload = Pick<EditorActionPayload, 'filename' | 'code'>;

interface EditorStateConfig {
  defaultActiveFile: string;
  files: IFileConfig[];
}

export class EditorState {
  _files: Map<string, Pick<IFileConfig, 'code' | 'type'>> = new Map();

  _activeFile: string;

  _history: EditorHistory;

  get activeFile() {
    return this._activeFile;
  }

  /**
   * 文件是否存在变更记录
   */
  get isFilesChanged() {
    return this._history.size > 1;
  }

  constructor(options?: EditorStateConfig) {
    this._history = new EditorHistory();
    this._activeFile = options?.defaultActiveFile;
    this.addFiles(options?.files);

    makeObservable(this, {
      _activeFile: observable,
      activeFile: computed,
      setActiveFile: action,
    });
  }

  clear() {
    this._files.clear();
    this._history.clear();
  }

  setActiveFile(filename: string) {
    this._activeFile = filename;
  }

  /**
   * 返回文件列表数组
   * @returns
   */
  listFileData() {
    const list: IFileConfig[] = [];
    this._files.forEach((value, filename) => {
      list.push({
        ...value,
        filename,
      });
    });
    return list;
  }

  /**
   * 返回文件列表对象
   * @returns 文件列表对象 { [filename]: code }
   */
  getFiles(): Record<string, string> {
    const fileCodes: Record<string, string> = {};
    this._files.forEach((fileData, filename) => {
      fileCodes[filename] = fileData.code;
    });
    return fileCodes;
  }

  addFile({ filename, ...rest }: AddFilePayload) {
    this._files.set(filename, rest);

    this._history.push({
      message: 'addFile',
      data: [
        {
          filename,
          ...rest,
        },
      ],
    });
  }

  addFiles(fileList: AddFilePayload[]) {
    if (!fileList || !fileList.length) {
      return;
    }

    fileList.forEach(({ filename, ...rest }) => {
      this._files.set(filename, rest);
    });

    this._history.push({
      message: 'addFiles',
      data: [...fileList],
    });
  }

  deleteFile({ filename }: DeleteFilePayload) {
    const file = this._files.get(filename);
    this._files.delete(filename);

    this._history.push({
      message: 'deleteFile',
      data: [
        {
          filename,
          ...file,
        },
      ],
    });
  }

  deleteFolder(payload: DeleteFilePayload) {
    const deleteFiles: AddFilePayload[] = [];
    const fileNames = Object.keys(this._files);
    for (const filename of fileNames) {
      if (filename.startsWith(payload.filename)) {
        const file = this._files.get(filename);
        deleteFiles.push({
          filename,
          ...file,
        });
        this._files.delete(filename);
      }
    }

    this._history.push({
      message: 'deleteFolder',
      data: deleteFiles,
    });
  }

  _renameFile({ filename, newFilename }: RenameFilePayload) {
    const fileData = this._files.get(filename);
    this._files.set(newFilename, { ...fileData });
    this._files.delete(filename);
  }

  renameFile(payload: RenameFilePayload) {
    this._renameFile(payload);

    this._history.push({
      message: 'renameFile',
      data: [payload],
    });
  }

  renameFolder({ filename: oldFolderName, newFilename: newFolderName }: RenameFilePayload) {
    const fileNames = Object.keys(this._files);
    for (const filename of fileNames) {
      if (filename.startsWith(oldFolderName)) {
        const newFilename = filename.replace(oldFolderName, newFolderName);
        this._renameFile({ filename, newFilename });
      }
    }

    this._history.push({
      message: 'renameFolder',
      data: [
        {
          filename: oldFolderName,
          newFilename: newFolderName,
        },
      ],
    });
  }

  updateFile({ filename, code }: UpdateFilePayload) {
    const fileData = this._files.get(filename);
    if (fileData.code === code) {
      // 代码未发生变化
      return;
    }

    fileData.code = code;
    this._files.set(filename, fileData);

    this._history.push({
      message: 'updateFile',
      data: [
        {
          filename,
          code: fileData.code,
        },
      ],
    });
  }
}

interface EditorHistoryRecord {
  data: Array<Partial<AddFilePayload>>;
  time: number;
  message: string;
}

/**
 * TODO: 实现上需要要 TangoHistory 合并
 */
class EditorHistory {
  _records: EditorHistoryRecord[] = [];
  _index = 0;
  _maxSize = 100;

  get size() {
    return this._records.length;
  }

  push(payload: Omit<EditorHistoryRecord, 'time'>) {
    if (this._index < this.size - 1) {
      this._records = this._records.slice(0, this._index + 1);
    }
    this._index = this.size;
    this._records.push({
      time: Date.now(),
      ...payload,
    });

    if (this.size > this._maxSize) {
      this._records.splice(0, this.size - this._maxSize);
      this._index = this.size - 1;
    }
  }

  clear() {
    this._records = [];
    this._index = 0;
  }
}
