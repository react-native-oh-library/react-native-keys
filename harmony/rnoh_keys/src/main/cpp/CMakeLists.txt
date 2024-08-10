cmake_minimum_required(VERSION 3.13)
set(CMAKE_VERBOSE_MAKEFILE on)

file(GLOB rnoh_keys_SRC CONFIGURE_DEPENDS
 *.cpp
 E:/rnoh28/rn_front/node_modules/react-native-keys/cpp/*.cpp
)

add_library(rnoh_keys SHARED ${rnoh_keys_SRC})

target_include_directories(rnoh_keys PUBLIC E:/rnoh28/rn_front/node_modules/react-native-keys/cpp)
target_include_directories(rnoh_keys PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})
target_include_directories(rnoh_keys PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/openssl/include)

target_link_libraries(rnoh_keys PUBLIC rnoh)

target_link_libraries(rnoh_keys PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/openssl/lib/libcrypto.a)
