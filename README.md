# URL Traversal Timer

A modern Chrome extension designed to automatically cycle through a list of URLs at a configurable time interval. Perfect for monitoring dashboards, kiosks, or automated browsing workflows.

## Features

- **Automated Cycling**: Automatically switches the current tab to the next URL in your list after a set time.
- **Configurable Interval**: Choose from preset intervals or set a custom time in seconds.
- **Dynamic List**: Add, remove, and reorder URLs on the fly.
- **Visual Timer**: Circular progress timer shows exactly when the next switch will happen.
- **Badge Status**: Real-time badge updates on the extension icon showing countdown and pause status.
- **Persistent State**: Your URLs and settings are saved automatically.
- **Background Traversal**: continues to work even if the popup is closed.

## Installation

### From Source

1.  Clone the repository:
    ```bash
    git clone https://github.com/iam-mustak-ak/url-traversal.git
    cd url-traversal
    ```

2.  Install dependencies:
    ```bash
    pnpm install
    # or
    npm install
    ```

3.  Build the extension:
    ```bash
    pnpm build
    # or
    npm run build
    ```

4.  Load into Chrome:
    - Open `chrome://extensions/`
    - Enable "Developer mode" in the top right.
    - Click "Load unpacked".
    - Select the `build/chrome-mv3-prod` directory.

## Development

This project is built with [Plasmo](https://docs.plasmo.com/), [React](https://react.dev/), and [Tailwind CSS](https://tailwindcss.com/).

To run the development server with live reload:

```bash
pnpm dev
```

## detailed Usage

1.  **Add URLs**: Open the extension popup, paste a URL, and click "Add".
2.  **Set Interval**: Click on the interval button (default 60s) to choose a new duration.
3.  **Start**: Click the "Start" button to begin cycling. The first URL in the list will load immediately.
4.  **Control**:
    - **Pause**: Temporarily stop the timer.
    - **Stop**: End the session and reset the timer.
    - **Reorder**: Drag and drop URLs to change the sequence (when not running).

## License

MIT
