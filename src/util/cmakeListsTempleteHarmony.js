/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

const path = require('path');

module.exports.cmakeListTemplete = (cppDirPath) => `cmake_minimum_required(VERSION 3.13)
set(CMAKE_VERBOSE_MAKEFILE on)

file(GLOB rnoh_keys_SRC CONFIGURE_DEPENDS
 *.cpp
 ${path.join(cppDirPath, '*.cpp').replace(/\\/g, '/')}
)

add_library(rnoh_keys SHARED \${rnoh_keys_SRC})

target_include_directories(rnoh_keys PUBLIC ${cppDirPath.replace(/\\/g, '/')})
target_include_directories(rnoh_keys PUBLIC \${CMAKE_CURRENT_SOURCE_DIR})
target_include_directories(rnoh_keys PRIVATE \${CMAKE_CURRENT_SOURCE_DIR}/openssl/include)

target_link_libraries(rnoh_keys PUBLIC rnoh)

target_link_libraries(rnoh_keys PRIVATE \${CMAKE_CURRENT_SOURCE_DIR}/openssl/lib/libcrypto.a)
`;