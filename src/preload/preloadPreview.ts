/*
    Copyright (c) 2025, Adrian Dusa
    All rights reserved.

    License: Academic Non-Commercial License (see LICENSE file for details).
    SPDX-License-Identifier: LicenseRef-ANCL-AdrianDusa
*/

import { bootPreviewController } from "../preview/previewController";
import { createElectronRendererTransport } from "../shell-electron/renderer/electronRendererTransport";

bootPreviewController(createElectronRendererTransport());
