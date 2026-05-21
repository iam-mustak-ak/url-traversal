# URL Traversal Timer

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Install-emerald?style=for-the-badge&logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/llaoilcbmlknmckecbdolgcbjneaecke?utm_source=item-share-cb)

A modern, high-performance Chrome extension designed to automatically cycle browser tabs through a list of URLs at configurable or randomized time intervals. Perfect for monitoring dashboards, kiosks, organic system testing, or automated browsing workflows.

## Features

- **Automated Cycling**: Automatically switches the current tab to the next URL in your list after the timer expires.
- **Configurable Fixed Intervals**: Choose from preset intervals (1 min, 3 min, 5 min) or set custom times down to the minute.
- **Skip URL Auto‑Pause/Resume**: Traversal automatically pauses when a URL matches a defined skip pattern and automatically resumes when navigating away, preserving the URL list across sessions.
- **Random Traversal Intervals (New!)**: Specify **Min** and **Max** bounds to randomize transition timers on every transition—mimicking organic human browsing behaviors.
- **Dynamic List**: Easily add, delete, and drag-and-drop to reorder URLs on the fly.
- **Visual Circular HUD**: Sleek circular progress timer shows exactly how many seconds remain before the next switch.
- **Icon Badge Status**: Real-time remaining seconds badge on the extension icon lets you track execution without opening the popup.
- **Background Traversal**: Built with Chrome Alarms so scheduling continues working reliably even if the popup is closed.
- **Persistent State**: URLs and settings are safely synced locally in your browser so they are ready between sessions.

## Installation

### From Chrome Web Store (Recommended)

Get it directly from the [Chrome Web Store](https://chromewebstore.google.com/detail/llaoilcbmlknmckecbdolgcbjneaecke?utm_source=item-share-cb) for automated updates and quick setup.

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

## Detailed Usage

1.  **Add URLs**: Open the extension popup, paste a URL, and click "Add".
2.  **Set Interval**: 
    - **Fixed Mode**: Set standard presets or customize exact time values.
    - **Random Mode**: Toggle the "Random" segmented button, enter your Min and Max interval values.
3.  **Start**: Click the "Start" button to begin cycling.
4.  **Control**:
    - **Pause**: Temporarily stop the timer.
    - **Resume**: pick up exactly where you left off.
    - **Stop**: End the session and reset the timers.
    - **Reorder**: Drag and drop URLs to change the sequence.

## Documentation

For an interactive user manual and a comprehensive breakdown of the under-the-hood technical system (decoupled background worker architectures, chrome alarms scheduling, and local storage layouts), open the [how-it-works.html](how-it-works.html) file inside your local workspace.

## License

MIT

