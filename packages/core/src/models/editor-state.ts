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
}

export class EditorState {
  _files: Map<string, Pick<IFileConfig, 'code' | 'type'>> = new Map();

  _activeFile: string;

  get activeFile() {
    return this._activeFile;
  }

  constructor(options?: EditorStateConfig) {
    this._activeFile = options?.defaultActiveFile;

    makeObservable(this, {
      _activeFile: observable,
      activeFile: computed,
      setActiveFile: action,
    });
  }

  clear() {
    this._files.clear();
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
  }

  addFiles(fileList: AddFilePayload[]) {
    fileList.forEach((file) => {
      this.addFile(file);
    });
  }

  deleteFile(payload: DeleteFilePayload) {
    this._files.delete(payload.filename);
  }

  deleteFolder(payload: DeleteFilePayload) {
    const fileNames = Object.keys(this._files);
    for (const filename of fileNames) {
      if (filename.startsWith(payload.filename)) {
        this.deleteFile({ filename });
      }
    }
  }

  renameFile({ filename, newFilename }: RenameFilePayload) {
    const fileData = this._files.get(filename);
    this.addFile({ ...fileData, filename: newFilename });
    this.deleteFile({ filename });
  }

  renameFolder({ filename: oldFolderName, newFilename: newFolderName }: RenameFilePayload) {
    const fileNames = Object.keys(this._files);
    for (const filename of fileNames) {
      if (filename.startsWith(oldFolderName)) {
        const newFilename = filename.replace(oldFolderName, newFolderName);
        this.renameFile({ filename, newFilename });
      }
    }
  }

  updateFile({ filename, code }: UpdateFilePayload) {
    const fileData = this._files.get(filename);
    fileData.code = code;
    this._files.set(filename, fileData);
  }
}
