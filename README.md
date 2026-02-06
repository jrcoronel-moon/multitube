# MultiTube

MultiTube is a modern web application that allows you to watch up to 5 YouTube live streams simultaneously in a single, responsive interface.

![MultiTube Screenshot](screenshot.jpg)

## Features

- **Multi-Stream Viewing**: Watch 1 to 5 YouTube streams at once.
- **Dynamic Layout**: The grid automatically adjusts based on the number of active streams.
- **Favorites System**: Easily load your favorite streams from a configuration file.
- **Premium UI**: Dark mode design with glassmorphism effects and smooth transitions.
- **Responsive**: Works on various screen sizes.

## Getting Started

### Prerequisites

- Node.js installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jrcoronel-moon/multitube.git
   ```
2. Navigate to the project directory:
   ```bash
   cd multitube
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the development server:

```bash
npm run dev
```

### MacOS App
To Run:
Double-click **MultiTube.app**. It should open `http://localhost:3999` in your browser.

### Windows App
To Run:
Double-click **start_windows.bat**.
1. It will start the server and open your default browser.
2. A command prompt window will stay open (this is the server).
3. Clicking "Quit App" in the browser will close this window automatically.

(If port 3999 was busy, please ensure it's free now, or the app might fail to bind to it).

## Troubleshooting

### "App is damaged and can't be opened"
If you move this app to another Mac, you might see an error saying the app is damaged. This is because the app is not digitally signed by Apple. To fix this:

1. Open Terminal.
2. Run the following command:
   ```bash
   xattr -cr /path/to/MultiTube.app
   ```
   (Tip: You can type `xattr -cr ` and then drag the app from Finder into the terminal window).

## Usage

1. **Add a Stream**: Paste a YouTube video or stream URL into the input field and click "Add Stream".
2. **Remove a Stream**: Hover over a video and click the "Remove" button.
3. **Load Favorites**: Create a `favorites.txt` file in the `public` folder with one URL per line. Click "Load Favorites" to add them instantly.

## License

MIT
