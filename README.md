# VLM-OCR Interface

A modern web interface for extracting text from images using Vision Language Models (VLM) and Optical Character Recognition (OCR) technology.

## Features

- **File Handling**: Upload images and PDF documents for text extraction
- **Multi-page Support**: Navigate through pages in multi-page documents (PDF, TIFF)
- **Format Options**: Export results in Markdown, JSON, or YAML formats
- **Theme Customization**: Choose between light, dark, or custom color themes
- **Responsive Design**: Clean Material Design 3 inspired interface that works across devices
- **Preview Controls**: Resize image preview pane for better visibility
- **Result Management**: Copy to clipboard or download extracted text

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd vlm-ocr-interface
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Click the upload area or drag and drop an image file
2. The image will be displayed in the preview area
3. For multi-page documents, use the navigation controls
4. Select your preferred output format (Markdown, JSON, YAML)
5. Click "Process" to extract text from the image
6. Once processing is complete, you can:
   - View the extracted text
   - Copy to clipboard
   - Download as a file

## Building for Production

```bash
npm run build
# or
yarn build
```

The production-ready files will be available in the `dist` directory.

## Technology Stack

- **TypeScript**: Type-safe JavaScript for better developer experience
- **SCSS**: Advanced styling with variables and mixins
- **Vite**: Modern frontend build tool for faster development
- **TailwindCSS**: Utility-first CSS framework

## Development

### Project Structure

```plaintext
vlm-ocr-interface/
├── dist/                 # Build output
├── src/
│   ├── index.ts          # Main application logic
│   ├── scss/             # SCSS style files
│   ├── input.css         # TailwindCSS input
│   └── styles.css        # Compiled styles
├── index.html            # Main HTML template
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.js        # Vite configuration
└── tailwind.config.js    # TailwindCSS configuration
```

### Available Scripts

- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run build:scss` - Compile SCSS to CSS
- `npm run watch:scss` - Watch and compile SCSS changes
