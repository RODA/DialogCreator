# Communication Procedure in DialogCreator

## The Current System (Custom Dispatcher)

This project uses a custom communication system built on top of Electron's IPC and Node's EventEmitter. The main features are:

- **Local (intra-window) events:**
  - Uses a local EventEmitter (`messenger`) for communication within a single renderer process (window).
  - Methods: `coms.emit(channel, ...args)` and `coms.on(channel, listener)`.
  - Example:
    ```typescript
    coms.emit('myEvent', data);
    coms.on('myEvent', handler);
    ```

- **IPC (inter-window) events:**
  - Uses Electron's `ipcRenderer` and `ipcMain` to send messages between windows and the main process.
  - Methods:
    - `coms.send(channel, ...args)`: Broadcasts to all windows.
    - `coms.sendTo(window, channel, ...args)`: Sends to a specific window or main process.
    - `coms.on(channel, listener)`: Registers a listener for IPC events (and also for local events).
  - Example:
    ```typescript
    coms.send('someChannel', arg1, arg2); // Broadcast
    coms.sendTo('editorWindow', 'someChannel', arg1, arg2); // Targeted
    coms.on('someChannel', handler); // Handles both local and IPC
    ```

- **Unified API:**
  - The `on` method is used for both local and IPC events, keeping the API simple and unified.
  - The system is encapsulated in the `coms` object.

- **Handlers and Automatic Dispatch:**
  - Some channels are automatically dispatched to handler modules via the `handlers` property and a loop that registers IPC listeners.

---

## LogRocket-Style IPC Potential Alternative

https://blog.logrocket.com/electron-ipc-response-request-architecture-with-typescript/

The LogRocket-style IPC system is an alternative architecture that emphasizes:

- **Request/response pattern with Promises**
- **Channel encapsulation (per-channel handler classes)**
- **Explicit response channels for each request**
- **Promise-based API for async/await usage**
- **Renderer-to-renderer forwarding via main process**

This system is not currently used in DialogCreator, but could be implemented if desired. See below for an example implementation:

```typescript
# If a LogRocket style IPC abstraction would be used

This architecture supports:
- Request/response with Promises
- Channel encapsulation (per-channel handler classes)
- Renderer-to-renderer forwarding via main
- No direct use of ipcRenderer in your app code (all via a service/bridge)

---

## 1. Shared Types

```typescript
// shared/IpcRequest.ts
export interface IpcRequest {
  responseChannel?: string;
  params?: any[];
  targetWindowId?: number; // For renderer-to-renderer
  forwardChannel?: string; // For renderer-to-renderer
}
```

---

## 2. Main Process: Channel Registration and Forwarding

```typescript
// main.ts
import { app, BrowserWindow, ipcMain } from 'electron';
import { IpcRequest } from '../shared/IpcRequest';

class ForwardChannel {
  getName() { return 'forward-message'; }
  handle(event: Electron.IpcMainEvent, request: IpcRequest) {
    if (request.targetWindowId && request.forwardChannel) {
      const win = BrowserWindow.fromId(request.targetWindowId);
      if (win && !win.isDestroyed() && !win.webContents.isDestroyed()) {
        win.webContents.send(request.forwardChannel, ...(request.params || []));
      }
    }
  }
}

// Register all channels
function registerIpcChannels(channels: { getName(): string; handle(event: Electron.IpcMainEvent, request: IpcRequest): void; }[]) {
  channels.forEach(channel =>
    ipcMain.on(channel.getName(), (event, request) => channel.handle(event, request))
  );
}

// Example: add your own channels here
registerIpcChannels([
  new ForwardChannel(),
  // ...other channel classes
]);

// Usual Electron app setup...
```

---

## 3. Renderer: IPC Service Abstraction

```typescript
// renderer/IpcService.ts
import { IpcRenderer } from 'electron';
import { IpcRequest } from '../shared/IpcRequest';
import { EventEmitter } from 'events';

export class IpcService {
  private ipcRenderer: IpcRenderer;
  private localEmitter = new EventEmitter();

  constructor(ipcRenderer: IpcRenderer) {
    this.ipcRenderer = ipcRenderer;
  }

  // Request/response to main
  public send<T>(channel: string, request: IpcRequest = {}): Promise<T> {
    if (!request.responseChannel) {
      request.responseChannel = `${channel}_response_${Date.now()}`;
    }
    this.ipcRenderer.send(channel, request);
    return new Promise(resolve => {
      this.ipcRenderer.once(request.responseChannel!, (_event, response) => resolve(response));
    });
  }

  // Fire-and-forget (no response expected)
  public fire(channel: string, request: IpcRequest = {}) {
    this.ipcRenderer.send(channel, request);
  }

  // Listen for messages (e.g., renderer-to-renderer)
  public on(channel: string, listener: (...args: any[]) => void) {
    this.ipcRenderer.on(channel, (_event, ...args) => listener(...args));
  }

  // Local (intra-window) event emitter
  public emitLocal(channel: string, ...args: any[]) {
    this.localEmitter.emit(channel, ...args);
  }
  public onLocal(channel: string, listener: (...args: any[]) => void) {
    this.localEmitter.on(channel, listener);
  }
}
```

---

## 4. Renderer-to-Renderer Forwarding Example

**In Renderer A (sender):**
```typescript
// Send a message to Renderer B (window id 2) on channel 'custom-message'
ipcService.fire('forward-message', {
  targetWindowId: 2,
  forwardChannel: 'custom-message',
  params: ['foo', 'bar']
});
```

**In Renderer B (receiver):**
```typescript
ipcService.on('custom-message', (arg1, arg2) => {
  console.log('Received from another renderer:', arg1, arg2);
});
```

---

## 5. Usage Example in Renderer

```typescript
// preload or renderer script
import { IpcService } from './IpcService';
const ipcService = new IpcService(window.require('electron').ipcRenderer);

// Request/response to main
ipcService.send<{ kernel: string }>('system-info').then(res => {
  console.log(res.kernel);
});

// Renderer-to-renderer
ipcService.fire('forward-message', {
  targetWindowId: 2,
  forwardChannel: 'custom-message',
  params: ['foo', 'bar']
});
```

---

## Why use generics with ipcService.send?

The syntax `ipcService.send<{ kernel: string }>('system-info').then(res => { ... })` uses TypeScript generics to specify the expected type of the response from the IPC call.

- `send<{ kernel: string }>(...)` tells TypeScript: “The response will be an object with a `kernel` property of type `string`.”
- This gives you type safety and autocompletion for `res.kernel` inside the `.then()` block.

If you use `ipcService.send('system-info').then(res => { ... })` without the generic, TypeScript will infer the response type as `any` or `unknown`, so you lose type safety and autocompletion.

**Summary:**
- Use the generic form for type safety and better developer experience.
- The non-generic form works, but you lose type checking on the response.

---

## Local Event Emitter (Intra-window Communication)

Your `coms.ts` system supports local (intra-window) event emission using an `EventEmitter` (e.g., `coms.emit('event', ...)` and `coms.on('event', ...)`). This allows decoupled communication between modules within the same renderer process (window), without IPC.

### Can this be replicated in the LogRocket-style system?
Yes! You can add a local event emitter to your IPC abstraction for intra-window communication. This is useful for modularity and decoupling, and does not require IPC.

### Example: Adding Local Event Emitter to LogRocket-style IPC

```typescript
// In your IpcService or a separate module
import { EventEmitter } from 'events';

export class IpcService {
  private ipcRenderer: IpcRenderer;
  private localEmitter = new EventEmitter();

  constructor(ipcRenderer: IpcRenderer) {
    this.ipcRenderer = ipcRenderer;
  }

  // ...existing send, fire, on methods for IPC...

  // Local (intra-window) event emitter
  public emitLocal(channel: string, ...args: any[]) {
    this.localEmitter.emit(channel, ...args);
  }
  public onLocal(channel: string, listener: (...args: any[]) => void) {
    this.localEmitter.on(channel, listener);
  }
}
```

**Usage:**
```typescript
// In the same window
ipcService.onLocal('myEvent', (data) => { ... });
ipcService.emitLocal('myEvent', someData);
```

**Summary:**
- You can have both local (intra-window) and IPC (inter-window) communication in the same abstraction.
- This matches the flexibility of your current `coms.ts` system.

---

## Unified `.on` for Local and IPC Events

In your system, `.on` is used for both local (intra-window) and IPC (inter-window) events, keeping the API simple and unified. This can be replicated in a LogRocket-style system as follows:

```typescript
import { EventEmitter } from 'events';

export class IpcService {
  private ipcRenderer: IpcRenderer;
  private localEmitter = new EventEmitter();

  constructor(ipcRenderer: IpcRenderer) {
    this.ipcRenderer = ipcRenderer;
  }

  // Unified .on for both local and IPC
  public on(channel: string, listener: (...args: any[]) => void) {
    // Local
    this.localEmitter.on(channel, listener);
    // IPC
    this.ipcRenderer.on(channel, (_event, ...args) => listener(...args));
  }

  // Local emit
  public emit(channel: string, ...args: any[]) {
    this.localEmitter.emit(channel, ...args);
  }

  // IPC fire-and-forget
  public fire(channel: string, ...args: any[]) {
    this.ipcRenderer.send(channel, ...args);
  }
}
```

**Usage:**
- Use `.on('event', handler)` everywhere, regardless of event source.
- Use `.emit('event', ...)` for local events, `.fire('event', ...)` for IPC events.

**Summary:**
- This approach matches your current system’s ergonomics and keeps the API simple.

---

**Summary:**
- The current system is custom, flexible, and unified for both local and IPC events.
- LogRocket-style is an alternative that could be adopted for more modular, Promise-based, and type-safe IPC.
