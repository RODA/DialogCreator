/*
    Copyright (c) 2025, Adrian Dusa
    All rights reserved.

    License: Academic Non-Commercial License (see LICENSE file for details).
    SPDX-License-Identifier: LicenseRef-ANCL-AdrianDusa
*/

import { bootDefaultsController } from "../defaults/defaultsController";
import { createElectronRendererTransport } from "../shell-electron/renderer/electronRendererTransport";

bootDefaultsController(createElectronRendererTransport());
