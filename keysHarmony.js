/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

#! /usr/bin/env node
const {
  getKeys,
  makeFileInAndroidMainAssetsFolder,
  makeFileInHarmonyEtsFolder,
  makeFileInHarmonyCppFolder,
  getHarmonyOsEnvironmentFile,
  generatePassword,
  encrypt,
  makeCppFileTemplate,
  splitPrivateKeyInto3ChunksOfArray,
  makeFileInCPPDir,
  genTSType,
  CPP_DIRECTORY_PATH,
  RN_KEYS_HMOS_CPP_DIR,
  HM_PROJECT_PATH
} = require('./src/util/common');

const { makeCryptographicModuleTemplateHarmony } = require('./src/util/keysFilesTemplateHarmony');
const { cmakeListTemplete } = require('./src/util/cmakeListsTempleteHarmony');
const { publicKeysToBuildProfile } = require('./src/util/generatePublicKeysToBuildProfile');

const makeHarmonyOSJnuFiles = () => {
  // 根据 node环境变量 process.env 拿到要读取的文件名
  const KEYS_FILE_NAME = getHarmonyOsEnvironmentFile();
  // 获取键值对象
  const allKeys = getKeys(KEYS_FILE_NAME);
  const secureKeys = allKeys.secure;
  const publicKeys = allKeys.public;
  const stringifyKeys = JSON.stringify(secureKeys);
  // 生成12位秘钥
  const password = generatePassword();
  // 使用crypto.js 加密
  const privateKey = encrypt(stringifyKeys, password);
  // 加密结果分为3段,返回的数组
  const privateKeyIn3Chunks = splitPrivateKeyInto3ChunksOfArray(privateKey);
  // cpp解密模板代码 
  const cppFileContent = makeCppFileTemplate(privateKeyIn3Chunks, password);
  // 将上一步生成的模板代码写入 cpp目录下 crypto.cpp
  const isDoneCryptoCppFile = makeFileInCPPDir(cppFileContent, 'crypto.cpp');

  // 拷贝public所有字段到 harmony工程build-profile.json5中
  const isDoneCopyPublicKeysToBuildProfile = publicKeysToBuildProfile(publicKeys); 
  const halfKey = privateKey.substr(privateKey.length / 2);
  const cryptographicModuleFileContent = makeCryptographicModuleTemplateHarmony(halfKey);
  const isDoneGenCmakeFile = makeFileInHarmonyCppFolder(
    cmakeListTemplete(CPP_DIRECTORY_PATH),
    'CMakeLists.txt'
  );
  const isDoneAddedPrivateKey = makeFileInHarmonyCppFolder(
    cryptographicModuleFileContent,
    'PrivateKey.h'
  );
  genTSType(allKeys);
  console.info('react-native-keys', {
    isDoneGenCmakeFile,
    isDoneCryptoCppFile,
    isDoneAddedPrivateKey,
    isDoneCopyPublicKeysToBuildProfile
  });
};
makeHarmonyOSJnuFiles();
