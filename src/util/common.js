/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

const fs = require('fs-extra');
const path = require('path');
const CryptoJS = require('crypto-js');
const { log } = require('console');
const DEFAULT_FILE_NAME = 'keys.development.json';


const PROJECT_ROOT_DIR_PATH = path.join(
  __dirname,
  '../../../../../'
);
const PACKAGE_ROOT_DIR_PATH = path.join(__dirname, '../../');
const RN_KEYS_PATH = path.join('node_modules', 'react-native-keys');
// const RN_KEYS_HM_PATH = path.join('node_modules', '@react-native-oh-tpl', 'react-native-keys');
const KEYS_SRC_PATH = path.join(RN_KEYS_PATH, 'src');
const KEYS_SRC_EXAMPLE_PATH = path.join('../', 'src');
const KEYS_IOS_EXAMPLE_PATH = path.join('../', 'ios');
const KEYS_ANDROID_EXAMPLE_PATH = path.join('../', 'android');

console.log("PROJECT_ROOT_DIR_PATH", PROJECT_ROOT_DIR_PATH);
console.log("PACKAGE_ROOT_DIR_PATH", PACKAGE_ROOT_DIR_PATH);


const CPP_DIRECTORY_PATH = path.join(
  PROJECT_ROOT_DIR_PATH,
  RN_KEYS_PATH,
  'cpp'
);

const SRC_PATH = path.join(
  PROJECT_ROOT_DIR_PATH,
  KEYS_SRC_PATH
);

/** 
 * HarmonyOs file path
 *
*/
const DEFAULT_HM_PROJECT_PATH = path.join(PACKAGE_ROOT_DIR_PATH, 'harmony');
const HM_PROJECT_PATH = process.env.HM_PROJECT_PATH || DEFAULT_HM_PROJECT_PATH;

module.exports.HM_PROJECT_PATH = HM_PROJECT_PATH;

const RN_KEYS_HMOS_MAIN_DIR = path.join(
  HM_PROJECT_PATH,
  process.env.HM_ENTRY_MODULE ?? 'entry',
  'oh_modules/@react-native-oh-tpl/react-native-keys/src/main'
);

module.exports.RN_KEYS_HM_CPP_DIR = path.join(
  RN_KEYS_HMOS_MAIN_DIR, 'cpp'
);

module.exports.RN_KEYS_HM_ETS_DIR = path.join(
  RN_KEYS_HMOS_MAIN_DIR, 'ets'
);


module.exports.CPP_DIRECTORY_PATH = CPP_DIRECTORY_PATH;


// ============================================================================

const PROJECT_DIRECTORY_IOS_PATH = path.join(PROJECT_ROOT_DIR_PATH, 'ios');

module.exports.getKeys = (KEYS_FILE_NAME) => {
  const jniJsonFilePath = `${PROJECT_ROOT_DIR_PATH}${KEYS_FILE_NAME}`.trim();
  const keysJson = fs.readJSONSync(jniJsonFilePath);
  const secureKeys = keysJson;
  return secureKeys;
};

module.exports.genTSType = (allKeys) => {
  let result =
    '// this file is auto generate, please do not modify\nexport type KeyTurboType = {';
  Object.keys(allKeys?.public ?? {}).forEach((key) => {
    result += `\n  ${key}: string;`;
  });
  if(!allKeys?.public) {
    result += '\n [key: string]: string;\n};\n\n';
  } else {
    result += '\n};\n\n';
  }
  result += 'export type KeyTurboSecuredType = {';
  Object.keys(allKeys?.secure ?? {}).forEach((key) => {
    result += `\n  ${key}: string;`;
  });
  if(!allKeys?.secure) {
    result += '\n [key: string]: string;\n};\n\n';
  } else {
    result += '\n};\n\n';
  }
  fs.outputFileSync(path.join(SRC_PATH, 'type.ts'), result);
};

module.exports.makeFileInCPPDir = (fileContent, fileName) => {
  try {
    console.log("CPP_DIRECTORY_PATH: ", CPP_DIRECTORY_PATH);
    const iosCppFilePath = path.join(CPP_DIRECTORY_PATH, fileName);
    fs.outputFileSync(iosCppFilePath, fileContent);
    return true;
  } catch (error) {
    return false;
  }
};


module.exports.getHarmonyOsEnvironmentFile = () => {
  try {
    let KEYS_FILE_NAME = process.env.KEYSFILE;
    if (KEYS_FILE_NAME) {
      return KEYS_FILE_NAME;
    } else if (process.env.DEFAULT_FILE_NAME) {
      return process.env.DEFAULT_FILE_NAME;
    } else if (
      process.env.DEBUG_KEYSFILE &&
      process.env.CONFIGURATION === 'Debug'
    ) {
      const debugFile = process.env.DEBUG_KEYSFILE;
      return debugFile;
    } else if (
      process.env.RELEASE_KEYSFILE &&
      process.env.CONFIGURATION === 'Release'
    ) {
      const debugFile = process.env.RELEASE_KEYSFILE;
      return debugFile;
    }
    return DEFAULT_FILE_NAME;
  } catch (error) {
    return DEFAULT_FILE_NAME;
  }
};


// harmonyos 
module.exports.makeFileInHarmonyEtsFolder = (fileContent, fileName) => {
  try {
    const filePath = path.join(this.RN_KEYS_HM_ETS_DIR, fileName);
    fs.outputFileSync(filePath, fileContent);
    return true;
  } catch (error) {
    console.error(error)
    return false;
  }
};

module.exports.makeFileInHarmonyCppFolder = (fileContent, fileName) => {
  try {
    const filePath = path.join(this.RN_KEYS_HM_CPP_DIR, fileName);
    fs.outputFileSync(filePath, fileContent);
    return true;
  } catch (error) {
    console.error(error)
    return false;
  }
};

module.exports.splitPrivateKeyInto3ChunksOfArray = (string) => {
  var regex = RegExp('.{1,' + Math.ceil(string.length / 3) + '}', 'g');
  return string.match(regex);
};

module.exports.makeCppFileTemplate = (privateKeyIn3Chunks, password) => {
  return `
   #include "crypto.h"
  #include <string>
  #include "decryptor.h"

  using namespace std;

  Crypto::Crypto() {

  }

  string Crypto::getJniJsonStringifyData(string key) {
      std::string base64Secret1 = "${privateKeyIn3Chunks[0]}";
      std::string base64Secret2 = "${privateKeyIn3Chunks[1]}";
      std::string base64Secret3 = "${privateKeyIn3Chunks[2]}";
      std::string base64Secret = base64Secret1 + base64Secret2 + base64Secret3;
       std::string password = "${password}";
      bool binary = false;
      std::string plaintext = decryptor::dec(base64Secret, password,binary);

      string hash;
      string halfString=base64Secret.substr(base64Secret.length()/2);
      if(key==halfString)
      {
          return plaintext;
      }
      else
      {
          return "";
      }
  }
  `;
};

module.exports.generatePassword = () => {
  var length = 12,
    charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    retVal = '';
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};
module.exports.encrypt = (message, password, _iv) => {
  const encrypted = CryptoJS.AES.encrypt(message, password, {
    iv: _iv,
  });

  const base64Secret = encrypted.toString();

  return base64Secret;
};
