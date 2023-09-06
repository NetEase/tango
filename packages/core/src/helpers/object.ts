import { ImportDeclarationPayloadType } from '../types';

/**
 * 导入列表解析为导入声明对象
 * @param names
 * @param nameMap
 * @returns
 */
export function namesToImportDeclarations(
  names: string[],
  nameMap: Record<string, { package: string; isDefault?: boolean }>,
) {
  const map = {};
  names.forEach((name) => {
    const mod = nameMap[name];
    if (mod) {
      updateMod(map, mod.package, name, mod.isDefault, !map[mod.package]);
    }
  });
  return Object.keys(map).map((sourcePath) => ({
    sourcePath,
    ...map[sourcePath],
  })) as ImportDeclarationPayloadType[];
}

function updateMod(
  map: any,
  fromPackage: string,
  specifier: string,
  isDefault = false,
  shouldInit = true,
) {
  if (shouldInit) {
    map[fromPackage] = {};
  }
  if (isDefault) {
    map[fromPackage].defaultSpecifier = specifier;
  } else if (map[fromPackage].specifiers) {
    map[fromPackage].specifiers.push(specifier);
  } else {
    map[fromPackage].specifiers = [specifier];
  }
}
