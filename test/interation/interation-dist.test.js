/**
 * 集成测试 for dist/index.js
 */

import { BtPlugin, BtApp, BtPage } from '../../dist/index';
import main from './main';

main({ BtPlugin, BtApp, BtPage });
