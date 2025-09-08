# WebDriver MCP Server

A Model Context Protocol (MCP) server implementation for Selenium WebDriver.

## Features

- Start browser sessions with customizable options
- Navigate to URLs
- Control navigation history (back, forward, refresh)
- Find elements using various locator strategies
- Click, type, and interact with elements
- Wait for element visibility, text, or attribute changes
- Retrieve element attributes, CSS values, and geometry
- Manage windows and frames
- Handle browser alerts
- Manage cookies and browser storage
- Adjust window size (set, maximize, minimize)
- Scroll elements into view or by offset and focus elements
- Manage multiple sessions (list, switch, rename)
- Perform mouse actions (hover, drag and drop)
- Handle keyboard input
- Take screenshots
- Record video of the browser session
- Upload files
- Support for headless mode
- Execute JavaScript

## Supported Browsers

- Chrome
- Firefox
- MS Edge


### Option 2: Add manually to desktop or CLI

* Name: `WebDriver MCP`
* Description: `Describes WebDriver API to AI agents.`
* Command: `npx -y @spectavi/webdriver-mcp`

## Use with other MCP clients (e.g. Claude Desktop, etc)
```json
{
  "mcpServers": {
    "selenium": {
      "command": "npx",
      "args": ["-y", "@spectavi/webdriver-mcp"]
    }
  }
}
```

---

## Development

To work on this project:

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the server: `npm start`

### Installation

#### Manual Installation
```bash
npm install -g @spectavi/webdriver-mcp
```


### Usage

Start the server by running:

```bash
webdriver-mcp
```

Or use with NPX in your MCP configuration:

```json
{
  "mcpServers": {
    "webdriver": {
      "command": "npx",
      "args": [
        "-y",
        "@spectavi/webdriver-mcp"
      ]
    }
  }
}
```



## Tools

### start_browser
Launches a browser session.

**Parameters:**
- `browser` (required): Browser to launch
  - Type: string
  - Enum: ["chrome", "firefox", "edge"]
- `options`: Browser configuration options
  - Type: object
  - Properties:
    - `headless`: Run browser in headless mode
      - Type: boolean
    - `arguments`: Additional browser arguments
      - Type: array of strings

**Example:**
```json
{
  "tool": "start_browser",
  "parameters": {
    "browser": "chrome",
    "options": {
      "headless": true,
      "arguments": ["--no-sandbox"]
    }
  }
}
```

### navigate
Navigates to a URL.

**Parameters:**
- `url` (required): URL to navigate to
  - Type: string

**Example:**
```json
{
  "tool": "navigate",
  "parameters": {
    "url": "https://www.example.com"
  }
}
```

### go_back
Navigates back in browser history.

**Parameters:**
- _None_

**Example:**
```json
{
  "tool": "go_back",
  "parameters": {}
}
```

### go_forward
Navigates forward in browser history.

**Parameters:**
- _None_

**Example:**
```json
{
  "tool": "go_forward",
  "parameters": {}
}
```

### refresh_page
Refreshes the current page.

**Parameters:**
- _None_

**Example:**
```json
{
  "tool": "refresh_page",
  "parameters": {}
}
```

### get_page_title
Retrieves the current page title.

**Parameters:**
- _None_

**Example:**
```json
{
  "tool": "get_page_title",
  "parameters": {}
}
```

### get_current_url
Retrieves the current page URL.

**Parameters:**
- _None_

**Example:**
```json
{
  "tool": "get_current_url",
  "parameters": {}
}
```

### get_page_source
Retrieves the current page source.

**Parameters:**
- _None_

**Example:**
```json
{
  "tool": "get_page_source",
  "parameters": {}
}
```

### find_element
Finds an element on the page.

**Parameters:**
- `by` (required): Locator strategy
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the locator strategy
  - Type: string
- `timeout`: Maximum time to wait for element in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "find_element",
  "parameters": {
    "by": "id",
    "value": "search-input",
    "timeout": 5000
  }
}
```

### click_element
Clicks an element.

**Parameters:**
- `by` (required): Locator strategy
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the locator strategy
  - Type: string
- `timeout`: Maximum time to wait for element in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "click_element",
  "parameters": {
    "by": "css",
    "value": ".submit-button"
  }
}
```

### send_keys
Sends keys to an element (typing).

**Parameters:**
- `by` (required): Locator strategy
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the locator strategy
  - Type: string
- `text` (required): Text to enter into the element
  - Type: string
- `timeout`: Maximum time to wait for element in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "send_keys",
  "parameters": {
    "by": "name",
    "value": "username",
    "text": "testuser"
  }
}
```

### get_element_text
Gets the text() of an element.

**Parameters:**
- `by` (required): Locator strategy
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the locator strategy
  - Type: string
- `timeout`: Maximum time to wait for element in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "get_element_text",
  "parameters": {
    "by": "css",
    "value": ".message"
  }
}
```

### wait_for_element_visible
Waits until an element is visible.

**Parameters:**
- `by` (required): Locator strategy
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the locator strategy
  - Type: string
- `timeout`: Maximum time to wait for element in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "wait_for_element_visible",
  "parameters": {
    "by": "css",
    "value": ".loading"
  }
}
```

### wait_for_element_not_visible
Waits until an element is not visible.

**Parameters:**
- `by` (required): Locator strategy
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the locator strategy
  - Type: string
- `timeout`: Maximum time to wait for element in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "wait_for_element_not_visible",
  "parameters": {
    "by": "id",
    "value": "spinner"
  }
}
```

### wait_for_text
Waits until an element's text matches or contains a value.

**Parameters:**
- `by` (required): Locator strategy
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the locator strategy
  - Type: string
- `text` (required): Text to wait for
  - Type: string
- `contains`: Whether to match partial text
  - Type: boolean
  - Default: false
- `timeout`: Maximum time to wait for text in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "wait_for_text",
  "parameters": {
    "by": "css",
    "value": ".message",
    "text": "Loaded",
    "contains": true
  }
}
```

### wait_for_attribute
Waits until an element's attribute has a given value.

**Parameters:**
- `by` (required): Locator strategy
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the locator strategy
  - Type: string
- `attribute` (required): Attribute name
  - Type: string
- `expected` (required): Expected attribute value
  - Type: string
- `contains`: Whether to match partial value
  - Type: boolean
  - Default: false
- `timeout`: Maximum time to wait for attribute in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "wait_for_attribute",
  "parameters": {
    "by": "css",
    "value": ".status",
    "attribute": "data-state",
    "expected": "ready"
  }
}
```

### get_element_attribute
Gets an attribute value of an element.

**Parameters:**
- `by` (required): Locator strategy
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the locator strategy
  - Type: string
- `attribute` (required): Attribute name to retrieve
  - Type: string
- `timeout`: Maximum time to wait for element in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "get_element_attribute",
  "parameters": {
    "by": "css",
    "value": "#username",
    "attribute": "placeholder"
  }
}
```

### get_css_value
Gets the computed CSS value of an element.

**Parameters:**
- `by` (required): Locator strategy
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the locator strategy
  - Type: string
- `property` (required): CSS property name
  - Type: string
- `timeout`: Maximum time to wait for element in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "get_css_value",
  "parameters": {
    "by": "css",
    "value": ".button",
    "property": "color"
  }
}
```

### get_element_rect
Gets the size and location of an element.

**Parameters:**
- `by` (required): Locator strategy
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the locator strategy
  - Type: string
- `timeout`: Maximum time to wait for element in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "get_element_rect",
  "parameters": {
    "by": "css",
    "value": "#logo"
  }
}
```

### hover
Moves the mouse to hover over an element.

**Parameters:**
- `by` (required): Locator strategy
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the locator strategy
  - Type: string
- `timeout`: Maximum time to wait for element in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "hover",
  "parameters": {
    "by": "css",
    "value": ".dropdown-menu"
  }
}
```

### drag_and_drop
Drags an element and drops it onto another element.

**Parameters:**
- `by` (required): Locator strategy for source element
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the source locator strategy
  - Type: string
- `targetBy` (required): Locator strategy for target element
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `targetValue` (required): Value for the target locator strategy
  - Type: string
- `timeout`: Maximum time to wait for elements in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "drag_and_drop",
  "parameters": {
    "by": "id",
    "value": "draggable",
    "targetBy": "id",
    "targetValue": "droppable"
  }
}
```

### double_click
Performs a double click on an element.

**Parameters:**
- `by` (required): Locator strategy
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the locator strategy
  - Type: string
- `timeout`: Maximum time to wait for element in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "double_click",
  "parameters": {
    "by": "css",
    "value": ".editable-text"
  }
}
```

### right_click
Performs a right click (context click) on an element.

**Parameters:**
- `by` (required): Locator strategy
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the locator strategy
  - Type: string
- `timeout`: Maximum time to wait for element in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "right_click",
  "parameters": {
    "by": "css",
    "value": ".context-menu-trigger"
  }
}
```

### press_key
Simulates pressing a keyboard key.

**Parameters:**
- `key` (required): Key to press (e.g., 'Enter', 'Tab', 'a', etc.)
  - Type: string

**Example:**
```json
{
  "tool": "press_key",
  "parameters": {
    "key": "Enter"
  }
}
```

### upload_file
Uploads a file using a file input element.

**Parameters:**
- `by` (required): Locator strategy
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the locator strategy
  - Type: string
- `filePath` (required): Absolute path to the file to upload
  - Type: string
- `timeout`: Maximum time to wait for element in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "upload_file",
  "parameters": {
    "by": "id",
    "value": "file-input",
    "filePath": "/path/to/file.pdf"
  }
}
```

### list_windows
Lists all available window handles.

**Parameters:**
None

**Example:**
```json
{
  "tool": "list_windows",
  "parameters": {}
}
```

### switch_to_window
Switches to a window by handle.

**Parameters:**
- `handle` (required): Window handle to switch to
  - Type: string

**Example:**
```json
{
  "tool": "switch_to_window",
  "parameters": {
    "handle": "CDwindow-123"
  }
}
```

### switch_to_frame
Switches to a frame located by a locator.

**Parameters:**
- `by` (required): Locator strategy
  - Type: string
  - Enum: ["id", "css", "xpath", "name", "tag", "class"]
- `value` (required): Value for the locator strategy
  - Type: string
- `timeout`: Maximum time to wait for element in milliseconds
  - Type: number
  - Default: 10000

**Example:**
```json
{
  "tool": "switch_to_frame",
  "parameters": {
    "by": "css",
    "value": "#frameId"
  }
}
```

### switch_to_parent_frame
Switches to the parent frame.

**Parameters:**
None

**Example:**
```json
{
  "tool": "switch_to_parent_frame",
  "parameters": {}
}
```

### get_alert_text
Retrieves the text of the currently displayed alert.

**Parameters:**
None

**Example:**
```json
{
  "tool": "get_alert_text",
  "parameters": {}
}
```

### accept_alert
Accepts the currently displayed alert.

**Parameters:**
None

**Example:**
```json
{
  "tool": "accept_alert",
  "parameters": {}
}
```

### dismiss_alert
Dismisses the currently displayed alert.

**Parameters:**
None

**Example:**
```json
{
  "tool": "dismiss_alert",
  "parameters": {}
}
```

### send_alert_text
Sends text input to a prompt alert.

**Parameters:**
- `text` (required): Text to send to the alert
  - Type: string

**Example:**
```json
{
  "tool": "send_alert_text",
  "parameters": {
    "text": "hello"
  }
}
```

### take_screenshot
Captures a screenshot of the current page.

**Parameters:**
- `outputPath` (optional): Path where to save the screenshot. If not provided, returns base64 data.
  - Type: string

**Example:**
```json
{
  "tool": "take_screenshot",
  "parameters": {
    "outputPath": "/path/to/screenshot.png"
  }
}
```

### start_recording
Starts recording the browser session to a video file.

This tool uses a bundled `ffmpeg` binary via the [`ffmpeg-static`](https://www.npmjs.com/package/ffmpeg-static) dependency, so no system installation is required.

**Parameters:**
- `outputPath` (required): Path where to save the video file.
  - Type: string
- `frameRate` (optional): Frames per second for the recording.
  - Type: number

**Example:**
```json
{
  "tool": "start_recording",
  "parameters": {
    "outputPath": "/path/to/recording.webm",
    "frameRate": 30
  }
}
```

### stop_recording
Stops the current browser recording.

**Parameters:**
- _None_

**Example:**
```json
{
  "tool": "stop_recording",
  "parameters": {}
}
```

### execute_javascript
Executes JavaScript code on the current page.

**Parameters:**
- `script` (required): JavaScript code to execute
  - Type: string
- `args` (optional): Arguments to pass to the script
  - Type: array

**Example:**
```json
{
  "tool": "execute_javascript",
  "parameters": {
    "script": "return document.title;",
    "args": []
  }
}
```

### close_session
Closes the current browser session and cleans up resources.

**Parameters:**
None required

**Example:**
```json
{
  "tool": "close_session",
  "parameters": {}
}
```


### set_window_size
Sets the browser window size.

**Parameters:**
- `width` (required): Window width in pixels  
  - Type: number
- `height` (required): Window height in pixels  
  - Type: number

**Example:**
```json
{
  "tool": "set_window_size",
  "parameters": { "width": 1024, "height": 768 }
}
```

### maximize_window
Maximizes the browser window.

**Parameters:**
None

**Example:**
```json
{ "tool": "maximize_window", "parameters": {} }
```

### minimize_window
Minimizes the browser window.

**Parameters:**
None

**Example:**
```json
{ "tool": "minimize_window", "parameters": {} }
```

### get_cookies
Retrieves all cookies for the current page.

**Parameters:**
None

**Example:**
```json
{ "tool": "get_cookies", "parameters": {} }
```

### add_cookie
Adds a cookie.

**Parameters:**
- `name` (required): Cookie name  
  - Type: string
- `value` (required): Cookie value  
  - Type: string
- `path`: Cookie path  
  - Type: string
- `domain`: Cookie domain  
  - Type: string
- `secure`: Is the cookie secure  
  - Type: boolean
- `httpOnly`: Is the cookie HTTP only  
  - Type: boolean
- `expiry`: Cookie expiry as Unix timestamp in seconds  
  - Type: number

**Example:**
```json
{
  "tool": "add_cookie",
  "parameters": { "name": "token", "value": "abc123" }
}
```

### delete_cookie
Deletes a cookie by name.

**Parameters:**
- `name` (required): Name of the cookie to delete  
  - Type: string

**Example:**
```json
{
  "tool": "delete_cookie",
  "parameters": { "name": "token" }
}
```

### get_local_storage_item
Retrieves a value from `localStorage`.

**Parameters:**
- `key` (required): Storage key  
  - Type: string

**Example:**
```json
{
  "tool": "get_local_storage_item",
  "parameters": { "key": "user" }
}
```

### set_local_storage_item
Sets a value in `localStorage`.

**Parameters:**
- `key` (required): Storage key  
  - Type: string
- `value` (required): Value to store  
  - Type: string

**Example:**
```json
{
  "tool": "set_local_storage_item",
  "parameters": { "key": "user", "value": "Bob" }
}
```

### remove_local_storage_item
Removes an item from `localStorage`.

**Parameters:**
- `key` (required): Storage key  
  - Type: string

**Example:**
```json
{
  "tool": "remove_local_storage_item",
  "parameters": { "key": "user" }
}
```

### get_session_storage_item
Retrieves a value from `sessionStorage`.

**Parameters:**
- `key` (required): Storage key  
  - Type: string

**Example:**
```json
{
  "tool": "get_session_storage_item",
  "parameters": { "key": "token" }
}
```

### set_session_storage_item
Sets a value in `sessionStorage`.

**Parameters:**
- `key` (required): Storage key  
  - Type: string
- `value` (required): Value to store  
  - Type: string

**Example:**
```json
{
  "tool": "set_session_storage_item",
  "parameters": { "key": "token", "value": "123" }
}
```

### remove_session_storage_item
Removes an item from `sessionStorage`.

**Parameters:**
- `key` (required): Storage key  
  - Type: string

**Example:**
```json
{
  "tool": "remove_session_storage_item",
  "parameters": { "key": "token" }
}
```

### scroll_element_into_view
Scrolls an element into view.

**Parameters:**
- `by` (required): Locator strategy  
  - Type: string
- `value` (required): Locator value  
  - Type: string
- `alignToTop`: Align element to top of viewport  
  - Type: boolean

**Example:**
```json
{
  "tool": "scroll_element_into_view",
  "parameters": { "by": "css", "value": "#footer" }
}
```

### scroll_by_offset
Scrolls the page by the given offset.

**Parameters:**
- `x` (required): Horizontal pixels to scroll  
  - Type: number
- `y` (required): Vertical pixels to scroll  
  - Type: number

**Example:**
```json
{
  "tool": "scroll_by_offset",
  "parameters": { "x": 0, "y": 200 }
}
```

### focus_element
Sets focus on an element.

**Parameters:**
- `by` (required): Locator strategy  
  - Type: string
- `value` (required): Locator value  
  - Type: string

**Example:**
```json
{
  "tool": "focus_element",
  "parameters": { "by": "id", "value": "username" }
}
```

### list_sessions
Lists active browser session IDs.

**Parameters:**
None

**Example:**
```json
{ "tool": "list_sessions", "parameters": {} }
```

### switch_session
Switches to a different active browser session.

**Parameters:**
- `sessionId` (required): Session ID to switch to  
  - Type: string

**Example:**
```json
{
  "tool": "switch_session",
  "parameters": { "sessionId": "chrome_123" }
}
```

### rename_session
Renames an existing browser session.

**Parameters:**
- `oldId` (required): Current session ID  
  - Type: string
- `newId` (required): New session ID  
  - Type: string

**Example:**
```json
{
  "tool": "rename_session",
  "parameters": { "oldId": "chrome_123", "newId": "primary" }
}
```
## License

MIT

* Project forked from https://github.com/angiejones/mcp-selenium
