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

import { RNOHLogger, TurboModule, RNOHContext } from '@rnoh/react-native-openharmony/ts';
import rnKeysCPPLib from 'librnoh_keys.so';
import BuildProfile from '../../../BuildProfile';

const LOGGER_NAME = '[RHOH] RNKeys';
const NOT_RETURN_KEYS = [ "HAR_VERSION",  "BUILD_MODE_NAME", "DEBUG", "TARGET_NAME" ];

export class RNKeysTurboModule extends TurboModule {

  private logger: RNOHLogger;

  constructor(ctx: RNOHContext) {
    super(ctx);
    this.logger = this.ctx.logger.clone(LOGGER_NAME);
  }

  /**
   * 返回buildProfile所有变量
   * */
  public getPublicKeys(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const k of Object.keys(BuildProfile)) {
      if (!NOT_RETURN_KEYS.includes(k)) {
        result[k] = (BuildProfile as object)[k];
      }
    }
    return result;
  }

  public getSecureKey(key: string) {
    try {
      const secretJsonString = rnKeysCPPLib.getCryptoValue();
      const secretObj: Record<string, string> = JSON.parse(secretJsonString);
      return secretObj[key];
    } catch (err) {
      this.logger.error(JSON.stringify(err));
      return '';
    }
  }
}