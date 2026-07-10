/*
    Copyright (c) 2025, Adrian Dusa
    All rights reserved.

    License: Academic Non-Commercial License (see LICENSE file for details).
    SPDX-License-Identifier: LicenseRef-ANCL-AdrianDusa
*/

import { bootEditor } from "../editor/editorBootstrap";
import { installElectronUpdateButton } from "../shell-electron/renderer/electronUpdateButton";
import { createElectronRendererTransport } from "../shell-electron/renderer/electronRendererTransport";

bootEditor(createElectronRendererTransport());
installElectronUpdateButton();
