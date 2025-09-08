#!/usr/bin/env node

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import pkg from 'selenium-webdriver';
const { Builder, By, Key, until, Actions } = pkg;
import { Options as ChromeOptions } from 'selenium-webdriver/chrome.js';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox.js';
import { Options as EdgeOptions } from 'selenium-webdriver/edge.js';
import { spawn } from 'child_process';


// Create an MCP server
const server = new McpServer({
    name: "MCP Selenium",
    version: "1.0.0"
});

// Server state
const state = {
    drivers: new Map(),
    currentSession: null,
    recordings: new Map()
};

// Helper functions
const getDriver = () => {
    const driver = state.drivers.get(state.currentSession);
    if (!driver) {
        throw new Error('No active browser session');
    }
    return driver;
};

const getLocator = (by, value) => {
    switch (by.toLowerCase()) {
        case 'id': return By.id(value);
        case 'css': return By.css(value);
        case 'xpath': return By.xpath(value);
        case 'name': return By.name(value);
        case 'tag': return By.css(value);
        case 'class': return By.className(value);
        default: throw new Error(`Unsupported locator strategy: ${by}`);
    }
};

// Common schemas
const browserOptionsSchema = z.object({
    headless: z.boolean().optional().describe("Run browser in headless mode"),
    arguments: z.array(z.string()).optional().describe("Additional browser arguments")
}).optional();

const locatorSchema = {
    by: z.enum(["id", "css", "xpath", "name", "tag", "class"]).describe("Locator strategy to find element"),
    value: z.string().describe("Value for the locator strategy"),
    timeout: z.number().optional().describe("Maximum time to wait for element in milliseconds")
};

// Browser Management Tools
server.tool(
    "start_browser",
    "launches browser",
    {
        browser: z.enum(["chrome", "firefox", "edge"]).describe("Browser to launch (chrome or firefox or microsoft edge)"),
        options: browserOptionsSchema
    },
    async ({ browser, options = {} }) => {
        try {
            let builder = new Builder();
            let driver;
            switch (browser) {
                case 'chrome': {
                    const chromeOptions = new ChromeOptions();
                    if (options.headless) {
                        chromeOptions.addArguments('--headless=new');
                    }
                    if (options.arguments) {
                        options.arguments.forEach(arg => chromeOptions.addArguments(arg));
                    }
                    driver = await builder
                        .forBrowser('chrome')
                        .setChromeOptions(chromeOptions)
                        .build();
                    break;
                }
                case 'edge': {
                    const edgeOptions = new EdgeOptions();
                    if (options.headless) {
                        edgeOptions.addArguments('--headless=new');
                    }
                    if (options.arguments) {
                        options.arguments.forEach(arg => edgeOptions.addArguments(arg));
                    }
                    driver = await builder
                        .forBrowser('edge')
                        .setEdgeOptions(edgeOptions)
                        .build();
                    break;
                }
                case 'firefox': {
                    const firefoxOptions = new FirefoxOptions();
                    if (options.headless) {
                        firefoxOptions.addArguments('--headless');
                    }
                    if (options.arguments) {
                        options.arguments.forEach(arg => firefoxOptions.addArguments(arg));
                    }
                    driver = await builder
                        .forBrowser('firefox')
                        .setFirefoxOptions(firefoxOptions)
                        .build();
                    break;
                }
                default: {
                    throw new Error(`Unsupported browser: ${browser}`);
                }
            }
            const sessionId = `${browser}_${Date.now()}`;
            state.drivers.set(sessionId, driver);
            state.currentSession = sessionId;

            return {
                content: [{ type: 'text', text: `Browser started with session_id: ${sessionId}` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error starting browser: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "navigate",
    "navigates to a URL",
    {
        url: z.string().describe("URL to navigate to")
    },
    async ({ url }) => {
        try {
            const driver = getDriver();
            await driver.get(url);
            return {
                content: [{ type: 'text', text: `Navigated to ${url}` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error navigating: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "go_back",
    "navigates back in browser history",
    {},
    async () => {
        try {
            const driver = getDriver();
            await driver.navigate().back();
            return {
                content: [{ type: 'text', text: 'Navigated back' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error navigating back: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "go_forward",
    "navigates forward in browser history",
    {},
    async () => {
        try {
            const driver = getDriver();
            await driver.navigate().forward();
            return {
                content: [{ type: 'text', text: 'Navigated forward' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error navigating forward: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "refresh_page",
    "refreshes the current page",
    {},
    async () => {
        try {
            const driver = getDriver();
            await driver.navigate().refresh();
            return {
                content: [{ type: 'text', text: 'Page refreshed' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error refreshing page: ${e.message}` }]
            };
        }
    }
);

// Page Metadata Tools
server.tool(
    "get_page_title",
    "retrieves the current page title",
    {},
    async () => {
        try {
            const driver = getDriver();
            const title = await driver.getTitle();
            return {
                content: [{ type: 'text', text: title }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error getting page title: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "get_current_url",
    "retrieves the current page URL",
    {},
    async () => {
        try {
            const driver = getDriver();
            const url = await driver.getCurrentUrl();
            return {
                content: [{ type: 'text', text: url }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error getting current URL: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "get_page_source",
    "retrieves the current page source",
    {},
    async () => {
        try {
            const driver = getDriver();
            const source = await driver.getPageSource();
            return {
                content: [{ type: 'text', text: source }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error getting page source: ${e.message}` }]
            };
        }
    }
);

// Element Interaction Tools
server.tool(
    "find_element",
    "finds an element",
    {
        ...locatorSchema
    },
    async ({ by, value, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            await driver.wait(until.elementLocated(locator), timeout);
            return {
                content: [{ type: 'text', text: 'Element found' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error finding element: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "click_element",
    "clicks an element",
    {
        ...locatorSchema
    },
    async ({ by, value, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            await element.click();
            return {
                content: [{ type: 'text', text: 'Element clicked' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error clicking element: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "send_keys",
    "sends keys to an element, aka typing",
    {
        ...locatorSchema,
        text: z.string().describe("Text to enter into the element")
    },
    async ({ by, value, text, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            await element.clear();
            await element.sendKeys(text);
            return {
                content: [{ type: 'text', text: `Text "${text}" entered into element` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error entering text: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "get_element_text",
    "gets the text() of an element",
    {
        ...locatorSchema
    },
    async ({ by, value, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            const text = await element.getText();
            return {
                content: [{ type: 'text', text }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error getting element text: ${e.message}` }]
            };
        }
    }
);

// Waiting and Visibility Tools
server.tool(
    "wait_for_element_visible",
    "waits until an element is visible",
    {
        ...locatorSchema
    },
    async ({ by, value, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            await driver.wait(until.elementIsVisible(element), timeout);
            return {
                content: [{ type: 'text', text: 'Element is visible' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error waiting for element visibility: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "wait_for_element_not_visible",
    "waits until an element is not visible",
    {
        ...locatorSchema
    },
    async ({ by, value, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            await driver.wait(until.elementIsNotVisible(element), timeout);
            return {
                content: [{ type: 'text', text: 'Element is not visible' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error waiting for element to become invisible: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "wait_for_text",
    "waits until an element's text matches or contains a given value",
    {
        ...locatorSchema,
        text: z.string().describe("Text to wait for"),
        contains: z.boolean().optional().describe("Whether to match partial text")
    },
    async ({ by, value, text, contains = false, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            if (contains) {
                await driver.wait(until.elementTextContains(element, text), timeout);
            } else {
                await driver.wait(until.elementTextIs(element, text), timeout);
            }
            return {
                content: [{ type: 'text', text: `Text '${text}' ${contains ? 'found in' : 'matches'} element` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error waiting for text: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "wait_for_attribute",
    "waits until an element's attribute has a given value",
    {
        ...locatorSchema,
        attribute: z.string().describe("Attribute name"),
        expected: z.string().describe("Expected attribute value"),
        contains: z.boolean().optional().describe("Whether to match partial value")
    },
    async ({ by, value, attribute, expected, contains = false, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            await driver.wait(async () => {
                const attr = await element.getAttribute(attribute);
                return contains ? attr?.includes(expected) : attr === expected;
            }, timeout);
            return {
                content: [{ type: 'text', text: `Attribute '${attribute}' ${contains ? 'contains' : 'equals'} '${expected}'` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error waiting for attribute: ${e.message}` }]
            };
        }
    }
);

// Element Metadata Tools
server.tool(
    "get_element_attribute",
    "gets an attribute value of an element",
    {
        ...locatorSchema,
        attribute: z.string().describe("Attribute name to retrieve")
    },
    async ({ by, value, attribute, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            const attrValue = await element.getAttribute(attribute);
            return {
                content: [{ type: 'text', text: attrValue ?? '' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error getting attribute: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "get_css_value",
    "gets the computed CSS value of an element",
    {
        ...locatorSchema,
        property: z.string().describe("CSS property name")
    },
    async ({ by, value, property, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            const cssValue = await element.getCssValue(property);
            return {
                content: [{ type: 'text', text: cssValue }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error getting CSS value: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "get_element_rect",
    "gets the size and location of an element",
    {
        ...locatorSchema
    },
    async ({ by, value, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            const rect = await element.getRect();
            return {
                content: [{ type: 'text', text: JSON.stringify(rect) }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error getting element rect: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "hover",
    "moves the mouse to hover over an element",
    {
        ...locatorSchema
    },
    async ({ by, value, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            const actions = driver.actions({ bridge: true });
            await actions.move({ origin: element }).perform();
            return {
                content: [{ type: 'text', text: 'Hovered over element' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error hovering over element: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "drag_and_drop",
    "drags an element and drops it onto another element",
    {
        ...locatorSchema,
        targetBy: z.enum(["id", "css", "xpath", "name", "tag", "class"]).describe("Locator strategy to find target element"),
        targetValue: z.string().describe("Value for the target locator strategy")
    },
    async ({ by, value, targetBy, targetValue, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const sourceLocator = getLocator(by, value);
            const targetLocator = getLocator(targetBy, targetValue);
            const sourceElement = await driver.wait(until.elementLocated(sourceLocator), timeout);
            const targetElement = await driver.wait(until.elementLocated(targetLocator), timeout);
            const actions = driver.actions({ bridge: true });
            await actions.dragAndDrop(sourceElement, targetElement).perform();
            return {
                content: [{ type: 'text', text: 'Drag and drop completed' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error performing drag and drop: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "double_click",
    "performs a double click on an element",
    {
        ...locatorSchema
    },
    async ({ by, value, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            const actions = driver.actions({ bridge: true });
            await actions.doubleClick(element).perform();
            return {
                content: [{ type: 'text', text: 'Double click performed' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error performing double click: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "right_click",
    "performs a right click (context click) on an element",
    {
        ...locatorSchema
    },
    async ({ by, value, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            const actions = driver.actions({ bridge: true });
            await actions.contextClick(element).perform();
            return {
                content: [{ type: 'text', text: 'Right click performed' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error performing right click: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "press_key",
    "simulates pressing a keyboard key",
    {
        key: z.string().describe("Key to press (e.g., 'Enter', 'Tab', 'a', etc.)")
    },
    async ({ key }) => {
        try {
            const driver = getDriver();
            const actions = driver.actions({ bridge: true });
            await actions.keyDown(key).keyUp(key).perform();
            return {
                content: [{ type: 'text', text: `Key '${key}' pressed` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error pressing key: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "upload_file",
    "uploads a file using a file input element",
    {
        ...locatorSchema,
        filePath: z.string().describe("Absolute path to the file to upload")
    },
    async ({ by, value, filePath, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            await element.sendKeys(filePath);
            return {
                content: [{ type: 'text', text: 'File upload initiated' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error uploading file: ${e.message}` }]
            };
        }
    }
);

// Window and Frame Management Tools
server.tool(
    "list_windows",
    "lists all available window handles",
    {},
    async () => {
        try {
            const driver = getDriver();
            const handles = await driver.getAllWindowHandles();
            return {
                content: [{ type: 'text', text: JSON.stringify(handles) }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error listing windows: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "switch_to_window",
    "switches to a window by handle",
    {
        handle: z.string().describe("Window handle to switch to")
    },
    async ({ handle }) => {
        try {
            const driver = getDriver();
            await driver.switchTo().window(handle);
            return {
                content: [{ type: 'text', text: `Switched to window ${handle}` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error switching window: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "switch_to_frame",
    "switches to a frame",
    {
        ...locatorSchema
    },
    async ({ by, value, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            await driver.switchTo().frame(element);
            return {
                content: [{ type: 'text', text: 'Switched to frame' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error switching to frame: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "switch_to_parent_frame",
    "switches to the parent frame",
    {},
    async () => {
        try {
            const driver = getDriver();
            await driver.switchTo().parentFrame();
            return {
                content: [{ type: 'text', text: 'Switched to parent frame' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error switching to parent frame: ${e.message}` }]
            };
        }
    }
);

// Window Sizing Tools
server.tool(
    "set_window_size",
    "sets the browser window size",
    {
        width: z.number().describe("Window width in pixels"),
        height: z.number().describe("Window height in pixels"),
    },
    async ({ width, height }) => {
        try {
            const driver = getDriver();
            await driver.manage().window().setRect({ width, height });
            return {
                content: [{ type: 'text', text: `Window size set to ${width}x${height}` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error setting window size: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "maximize_window",
    "maximizes the browser window",
    {},
    async () => {
        try {
            const driver = getDriver();
            await driver.manage().window().maximize();
            return {
                content: [{ type: 'text', text: 'Window maximized' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error maximizing window: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "minimize_window",
    "minimizes the browser window",
    {},
    async () => {
        try {
            const driver = getDriver();
            await driver.manage().window().minimize();
            return {
                content: [{ type: 'text', text: 'Window minimized' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error minimizing window: ${e.message}` }]
            };
        }
    }
);

// Alert Handling Tools
server.tool(
    "get_alert_text",
    "retrieves the text of the currently displayed alert",
    {},
    async () => {
        try {
            const driver = getDriver();
            const alert = await driver.switchTo().alert();
            const text = await alert.getText();
            return {
                content: [{ type: 'text', text }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error getting alert text: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "accept_alert",
    "accepts the currently displayed alert",
    {},
    async () => {
        try {
            const driver = getDriver();
            const alert = await driver.switchTo().alert();
            await alert.accept();
            return {
                content: [{ type: 'text', text: 'Alert accepted' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error accepting alert: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "dismiss_alert",
    "dismisses the currently displayed alert",
    {},
    async () => {
        try {
            const driver = getDriver();
            const alert = await driver.switchTo().alert();
            await alert.dismiss();
            return {
                content: [{ type: 'text', text: 'Alert dismissed' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error dismissing alert: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "send_alert_text",
    "sends text to a prompt alert",
    {
        text: z.string().describe("Text to send to the alert")
    },
    async ({ text }) => {
        try {
            const driver = getDriver();
            const alert = await driver.switchTo().alert();
            await alert.sendKeys(text);
            return {
                content: [{ type: 'text', text: `Sent text to alert: ${text}` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error sending alert text: ${e.message}` }]
            };
        }
    }
);

// Cookie and Storage Management Tools
server.tool(
    "get_cookies",
    "retrieves all cookies",
    {},
    async () => {
        try {
            const driver = getDriver();
            const cookies = await driver.manage().getCookies();
            return {
                content: [{ type: 'text', text: JSON.stringify(cookies) }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error getting cookies: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "add_cookie",
    "adds a cookie",
    {
        name: z.string().describe("Cookie name"),
        value: z.string().describe("Cookie value"),
        path: z.string().optional().describe("Cookie path"),
        domain: z.string().optional().describe("Cookie domain"),
        secure: z.boolean().optional().describe("Is the cookie secure"),
        httpOnly: z.boolean().optional().describe("Is the cookie HTTP only"),
        expiry: z.number().optional().describe("Cookie expiry as Unix timestamp in seconds")
    },
    async ({ name, value, path, domain, secure, httpOnly, expiry }) => {
        try {
            const driver = getDriver();
            const cookie = { name, value };
            if (path !== undefined) cookie.path = path;
            if (domain !== undefined) cookie.domain = domain;
            if (secure !== undefined) cookie.secure = secure;
            if (httpOnly !== undefined) cookie.httpOnly = httpOnly;
            if (expiry !== undefined) cookie.expiry = expiry;
            await driver.manage().addCookie(cookie);
            return {
                content: [{ type: 'text', text: `Cookie ${name} added` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error adding cookie: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "delete_cookie",
    "deletes a cookie by name",
    {
        name: z.string().describe("Name of the cookie to delete")
    },
    async ({ name }) => {
        try {
            const driver = getDriver();
            await driver.manage().deleteCookie(name);
            return {
                content: [{ type: 'text', text: `Cookie ${name} deleted` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error deleting cookie: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "get_local_storage_item",
    "retrieves a value from localStorage",
    {
        key: z.string().describe("Storage key")
    },
    async ({ key }) => {
        try {
            const driver = getDriver();
            const value = await driver.executeScript('return window.localStorage.getItem(arguments[0]);', key);
            return {
                content: [{ type: 'text', text: value ?? '' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error getting local storage item: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "set_local_storage_item",
    "sets a value in localStorage",
    {
        key: z.string().describe("Storage key"),
        value: z.string().describe("Value to store")
    },
    async ({ key, value }) => {
        try {
            const driver = getDriver();
            await driver.executeScript('window.localStorage.setItem(arguments[0], arguments[1]);', key, value);
            return {
                content: [{ type: 'text', text: `Set localStorage item ${key}` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error setting local storage item: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "remove_local_storage_item",
    "removes an item from localStorage",
    {
        key: z.string().describe("Storage key")
    },
    async ({ key }) => {
        try {
            const driver = getDriver();
            await driver.executeScript('window.localStorage.removeItem(arguments[0]);', key);
            return {
                content: [{ type: 'text', text: `Removed localStorage item ${key}` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error removing local storage item: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "get_session_storage_item",
    "retrieves a value from sessionStorage",
    {
        key: z.string().describe("Storage key")
    },
    async ({ key }) => {
        try {
            const driver = getDriver();
            const value = await driver.executeScript('return window.sessionStorage.getItem(arguments[0]);', key);
            return {
                content: [{ type: 'text', text: value ?? '' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error getting session storage item: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "set_session_storage_item",
    "sets a value in sessionStorage",
    {
        key: z.string().describe("Storage key"),
        value: z.string().describe("Value to store")
    },
    async ({ key, value }) => {
        try {
            const driver = getDriver();
            await driver.executeScript('window.sessionStorage.setItem(arguments[0], arguments[1]);', key, value);
            return {
                content: [{ type: 'text', text: `Set sessionStorage item ${key}` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error setting session storage item: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "remove_session_storage_item",
    "removes an item from sessionStorage",
    {
        key: z.string().describe("Storage key")
    },
    async ({ key }) => {
        try {
            const driver = getDriver();
            await driver.executeScript('window.sessionStorage.removeItem(arguments[0]);', key);
            return {
                content: [{ type: 'text', text: `Removed sessionStorage item ${key}` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error removing session storage item: ${e.message}` }]
            };
        }
    }
);

// Scrolling and Focus Tools
server.tool(
    "scroll_element_into_view",
    "scrolls an element into view",
    {
        ...locatorSchema,
        alignToTop: z.boolean().optional().describe("Align element to top of viewport")
    },
    async ({ by, value, alignToTop = true, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            await driver.executeScript('arguments[0].scrollIntoView(arguments[1]);', element, alignToTop);
            return {
                content: [{ type: 'text', text: 'Element scrolled into view' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error scrolling element into view: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "scroll_by_offset",
    "scrolls the page by the given offset",
    {
        x: z.number().describe("Horizontal pixels to scroll"),
        y: z.number().describe("Vertical pixels to scroll")
    },
    async ({ x, y }) => {
        try {
            const driver = getDriver();
            await driver.executeScript('window.scrollBy(arguments[0], arguments[1]);', x, y);
            return {
                content: [{ type: 'text', text: `Scrolled by ${x},${y}` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error scrolling by offset: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "focus_element",
    "sets focus on an element",
    {
        ...locatorSchema
    },
    async ({ by, value, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            await driver.executeScript('arguments[0].focus();', element);
            return {
                content: [{ type: 'text', text: 'Element focused' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error focusing element: ${e.message}` }]
            };
        }
    }
);

// Session Management Tools
server.tool(
    "list_sessions",
    "lists active browser session IDs",
    {},
    async () => {
        try {
            const sessions = Array.from(state.drivers.keys());
            return {
                content: [{ type: 'text', text: JSON.stringify(sessions) }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error listing sessions: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "switch_session",
    "switches to a different active browser session",
    {
        sessionId: z.string().describe("Session ID to switch to")
    },
    async ({ sessionId }) => {
        try {
            if (!state.drivers.has(sessionId)) {
                throw new Error(`Session ${sessionId} not found`);
            }
            state.currentSession = sessionId;
            return {
                content: [{ type: 'text', text: `Switched to session ${sessionId}` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error switching session: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "rename_session",
    "renames an existing browser session",
    {
        oldId: z.string().describe("Current session ID"),
        newId: z.string().describe("New session ID")
    },
    async ({ oldId, newId }) => {
        try {
            if (!state.drivers.has(oldId)) {
                throw new Error(`Session ${oldId} not found`);
            }
            if (state.drivers.has(newId)) {
                throw new Error(`Session ${newId} already exists`);
            }
            const driver = state.drivers.get(oldId);
            state.drivers.set(newId, driver);
            state.drivers.delete(oldId);
            if (state.currentSession === oldId) {
                state.currentSession = newId;
            }
            return {
                content: [{ type: 'text', text: `Renamed session ${oldId} to ${newId}` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error renaming session: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "start_recording",
    "starts recording the browser session",
    {
        outputPath: z.string().describe("File path to save the recording"),
        frameRate: z.number().optional().describe("Frames per second")
    },
    async ({ outputPath, frameRate = 30 }) => {
        try {
            const driver = getDriver();
            const cdp = await driver.createCDPSession();
            let ffmpegPath = 'ffmpeg';
            try {
                ffmpegPath = (await import('ffmpeg-static')).default || ffmpegPath;
            } catch {}
            const ffmpeg = spawn(
                ffmpegPath,
                ['-y', '-f', 'image2pipe', '-framerate', String(frameRate), '-i', '-', outputPath]
            );

            cdp.on('Page.screencastFrame', async (frame) => {
                ffmpeg.stdin.write(Buffer.from(frame.data, 'base64'));
                await cdp.send('Page.screencastFrameAck', { sessionId: frame.sessionId });
            });

            await cdp.send('Page.startScreencast', { format: 'png' });
            state.recordings.set(state.currentSession, { cdp, ffmpeg, outputPath });

            return {
                content: [{ type: 'text', text: `Recording started: ${outputPath}` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error starting recording: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "stop_recording",
    "stops the active recording",
    {},
    async () => {
        try {
            const rec = state.recordings.get(state.currentSession);
            if (!rec) {
                throw new Error('No active recording');
            }
            const { cdp, ffmpeg, outputPath } = rec;
            await cdp.send('Page.stopScreencast');
            ffmpeg.stdin.end();

            await new Promise((resolve, reject) => {
                ffmpeg.on('close', code => {
                    if (code === 0) resolve();
                    else reject(new Error(`ffmpeg exited with code ${code}`));
                });
            });

            state.recordings.delete(state.currentSession);

            return {
                content: [{ type: 'text', text: `Recording saved to ${outputPath}` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error stopping recording: ${e.message}` }]
            };
        }
    }
);

// Logging and Diagnostics Tools
server.tool(
    "get_console_logs",
    "retrieves browser console logs",
    {},
    async () => {
        try {
            const driver = getDriver();
            const logs = await driver.manage().logs().get('browser');
            return {
                content: [{ type: 'text', text: JSON.stringify(logs, null, 2) }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error retrieving console logs: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "get_network_logs",
    "retrieves network logs",
    {},
    async () => {
        try {
            const driver = getDriver();
            const logs = await driver.manage().logs().get('performance');
            const networkEvents = logs
                .map(entry => {
                    try {
                        return JSON.parse(entry.message).message;
                    } catch {
                        return null;
                    }
                })
                .filter(msg => msg && msg.method && msg.method.startsWith('Network.'));
            return {
                content: [{ type: 'text', text: JSON.stringify(networkEvents, null, 2) }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error retrieving network logs: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "get_performance_metrics",
    "retrieves performance timing metrics",
    {},
    async () => {
        try {
            const driver = getDriver();
            const timing = await driver.executeScript('return window.performance.timing');
            return {
                content: [{ type: 'text', text: JSON.stringify(timing, null, 2) }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error retrieving performance metrics: ${e.message}` }]
            };
        }
    }
);

// Assertion Tools
server.tool(
    "assert_element_present",
    "verifies that an element is present on the page",
    {
        ...locatorSchema
    },
    async ({ by, value, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            await driver.wait(until.elementLocated(locator), timeout);
            return {
                content: [{ type: 'text', text: 'Element is present' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Assertion failed: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "assert_element_text",
    "verifies that an element has expected text",
    {
        ...locatorSchema,
        expected: z.string().describe("Expected text value")
    },
    async ({ by, value, expected, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            const text = await element.getText();
            if (text === expected) {
                return { content: [{ type: 'text', text: 'Text assertion passed' }] };
            } else {
                throw new Error(`Expected "${expected}", but found "${text}"`);
            }
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Assertion failed: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "assert_element_attribute",
    "verifies that an element attribute has expected value",
    {
        ...locatorSchema,
        attribute: z.string().describe("Attribute name"),
        expected: z.string().describe("Expected attribute value")
    },
    async ({ by, value, attribute, expected, timeout = 10000 }) => {
        try {
            const driver = getDriver();
            const locator = getLocator(by, value);
            const element = await driver.wait(until.elementLocated(locator), timeout);
            const attrValue = await element.getAttribute(attribute);
            if (attrValue === expected) {
                return { content: [{ type: 'text', text: 'Attribute assertion passed' }] };
            } else {
                throw new Error(`Expected "${attribute}" to be "${expected}", but found "${attrValue}"`);
            }
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Assertion failed: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "take_screenshot",
    "captures a screenshot of the current page",
    {
        outputPath: z.string().optional().describe("Optional path where to save the screenshot. If not provided, returns base64 data.")
    },
    async ({ outputPath }) => {
        try {
            const driver = getDriver();
            const screenshot = await driver.takeScreenshot();
            if (outputPath) {
                const fs = await import('fs');
                await fs.promises.writeFile(outputPath, screenshot, 'base64');
                return {
                    content: [{ type: 'text', text: `Screenshot saved to ${outputPath}` }]
                };
            } else {
                return {
                    content: [
                        { type: 'text', text: 'Screenshot captured as base64:' },
                        { type: 'text', text: screenshot }
                    ]
                };
            }
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error taking screenshot: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "execute_javascript",
    "executes JavaScript code on the current page",
    {
        script: z.string().describe("JavaScript code to execute"),
        args: z.array(z.any()).optional().describe("Arguments to pass to the script")
    },
    async ({ script, args = [] }) => {
        try {
            const driver = getDriver();
            const result = await driver.executeScript(script, ...args);
            return {
                content: [{ type: 'text', text: result !== null && result !== undefined ? JSON.stringify(result, null, 2) : 'Script executed successfully (no return value)' }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error executing JavaScript: ${e.message}` }]
            };
        }
    }
);

server.tool(
    "close_session",
    "closes the current browser session",
    {},
    async () => {
        try {
            const driver = getDriver();
            await driver.quit();
            state.drivers.delete(state.currentSession);
            const sessionId = state.currentSession;
            state.currentSession = null;
            return {
                content: [{ type: 'text', text: `Browser session ${sessionId} closed` }]
            };
        } catch (e) {
            return {
                content: [{ type: 'text', text: `Error closing session: ${e.message}` }]
            };
        }
    }
);

// Resources
server.resource(
    "browser-status",
    new ResourceTemplate("browser-status://current"),
    async (uri) => ({
        contents: [{
            uri: uri.href,
            text: state.currentSession
                ? `Active browser session: ${state.currentSession}`
                : "No active browser session"
        }]
    })
);

// Cleanup handler
async function cleanup() {
    for (const [sessionId, driver] of state.drivers) {
        try {
            await driver.quit();
        } catch (e) {
            console.error(`Error closing browser session ${sessionId}:`, e);
        }
    }
    state.drivers.clear();
    state.currentSession = null;
    process.exit(0);
}

process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);

// Exported for testing
export { getLocator, server, state, cleanup };

// Start the server only when executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
