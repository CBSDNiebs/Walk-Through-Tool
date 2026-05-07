# Walkthrough Tool

A lightweight, purely client-side web application designed for educational administrators and coaches to conduct classroom walkthroughs. The tool allows observers to record timed metrics for:
- Opportunities to Respond (OTRs)
- Praise & Feedback (Positive vs. Negative ratio)
- Classroom Engagement

It automatically records these metrics over time, calculates important ratios against teaching goals, and generates an easily sharable PNG image chart of the results. 

## Features
- **3 Observation Modes:** Choose between compiling general OTRs, specific Praise feedback, or Engagement metrics.
- **Real-time Live Charting:** Converts timestamped observations into a stacked timeline (Gantt-style) or timeline line charts.
- **Completely Private:** Runs entirely in the browser. No data is sent to a backend server.
- **Easy Sharing:** A single click formats the observation data into an image, copies it to the clipboard, and allows easy pasting into emails or spreadsheets.

## Getting Started

Because the application is written entirely with vanilla HTML, CSS, and JavaScript without a build-step requirement, you can run the app directly in a browser or serve it over a local dev server.

### Prerequisites
- Node.js (v18 or higher recommended)

### Running
1. Clone the repository
2. Install standard dependencies (Vite for local hosting):
   ```bash
   npm install
   ```
3. Start the local server:
   ```bash
   npm run dev
   ```
4. Open the application in your browser at `http://localhost:3000`

### Building for production
To build a minified production version of the walkthrough tool:
```bash
npm run build
```
This will place the static assets in the `/dist` directory, which can be deployed to any static host (GitHub Pages, Vercel, Netlify, etc.).

## Usage
1. Enter the Educator's name on the setup screen.
2. Select the observation mode (OTRs, Praise, or Engagement).
3. Start the timer during your observation and click the appropriate category buttons to timestamp each event.
4. Stop the timer, fill in the post-observation questions, and proceed to the Results page.
5. Hit **Share** to capture the chart and observation notes as a PNG to your clipboard.

## License
MIT
