/**
 * MIT License
 *
 * Copyright (C) 2024 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

#include "RNKeysTurboModule.h"
#include "RNOH/ArkJS.h"
#include "PrivateKey.h"

namespace rnoh {
using namespace facebook;

RNKeysTurboModule::RNKeysTurboModule(const ArkTSTurboModule::Context ctx, const std::string name)
    : ArkTSTurboModule(ctx, name) {

    methodMap_ = {
        // install 方法会给global对象绑定两个方法
        {"install",
         {0, [](jsi::Runtime &rt, react::TurboModule &turboModule, const jsi::Value *args, size_t count) {
              // 设置全局方法
              auto funcProp1 = jsi::PropNameID::forAscii(rt, "publicKeys");
              rt.global().setProperty(
                  rt, funcProp1,
                  jsi::Function::createFromHostFunction(
                      rt, funcProp1, 0,
                      [&turboModule](jsi::Runtime &rt, const jsi::Value &, const jsi::Value *args,
                                     size_t argc) -> jsi::Value {
                          // 调用turboModule中 getPublicKeys方法， PublicKeys使用 napi 调用c
                          return static_cast<ArkTSTurboModule &>(turboModule).call(rt, "getPublicKeys", args, 0);
                      }));


              auto funcProp2 = jsi::PropNameID::forAscii(rt, "secureFor");
              rt.global().setProperty(
                  rt, funcProp2,
                  jsi::Function::createFromHostFunction(
                      rt, funcProp2, 1,
                      [&turboModule](jsi::Runtime &rt, const jsi::Value &, const jsi::Value *args,
                                     size_t argc) -> jsi::Value {
                          return static_cast<ArkTSTurboModule &>(turboModule).call(rt, "getSecureKey", args, 1);
                      }));
              return jsi::Value(true);
          }}}};
}

} // namespace rnoh
