// Material Design 3 - VLM OCR Interface Implementation

// Types for our application
type FormatType = 'markdown' | 'json' | 'yaml';
type ThemeType = 'light' | 'dark' | 'custom';

interface FileDisplayState {
  file: File | null;
  currentPage: number;
  totalPages: number;
  format: FormatType;
  status: 'ready' | 'processing' | 'complete' | 'error';
}

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const fileInput = document.getElementById("fileInput") as HTMLInputElement;
  const fileDetails = document.getElementById("fileDetails") as HTMLDivElement;
  const imagePreview = document.getElementById("imagePreview") as HTMLDivElement;
  const imgElement = imagePreview.querySelector("img") as HTMLImageElement;
  const emptyState = imagePreview.querySelector(".empty-state") as HTMLDivElement;
  const pageControls = imagePreview.querySelector(".page-controls") as HTMLDivElement;
  const prevPageBtn = document.getElementById("prevPage") as HTMLButtonElement;
  const nextPageBtn = document.getElementById("nextPage") as HTMLButtonElement;
  const pageInfo = document.getElementById("pageInfo") as HTMLSpanElement;
  const processButton = document.getElementById("processButton") as HTMLButtonElement;
  const downloadButton = document.getElementById("downloadButton") as HTMLButtonElement;
  const copyButton = document.getElementById("copyButton") as HTMLButtonElement;
  const statusText = document.getElementById("statusText") as HTMLSpanElement;
  const colorOptions = document.querySelectorAll(".color-option") as NodeListOf<HTMLButtonElement>;
  const formatOptions = document.querySelectorAll(".chip-selectable") as NodeListOf<HTMLButtonElement>;
  const ocrTextarea = document.querySelector("#ocrOutput textarea") as HTMLTextAreaElement;
  const colorPickerModal = document.getElementById("colorPickerModal") as HTMLDivElement;
  const colorPicker = document.getElementById("colorPicker") as HTMLInputElement;
  const applyCustomColorBtn = document.getElementById("applyCustomColor") as HTMLButtonElement;
  const cancelCustomColorBtn = document.getElementById("cancelCustomColor") as HTMLButtonElement;

  // State
  const state: FileDisplayState = {
    file: null,
    currentPage: 0,
    totalPages: 0,
    format: 'markdown',
    status: 'ready'
  };

  // Load saved theme from localStorage if available
  initializeTheme();

  // Additional DOM elements
  const togglePreviewSizeBtn = document.getElementById("togglePreviewSize") as HTMLButtonElement;
  const previewSection = document.querySelector(".preview-section") as HTMLDivElement;

  // Track preview size state
  let isPreviewLarge = false;

  // Event Listeners
  fileInput.addEventListener("change", handleFileChange);
  processButton.addEventListener("click", processImage);
  downloadButton.addEventListener("click", downloadResults);
  copyButton.addEventListener("click", copyToClipboard);
  prevPageBtn.addEventListener("click", () => navigatePage(-1));
  nextPageBtn.addEventListener("click", () => navigatePage(1));
  togglePreviewSizeBtn.addEventListener("click", togglePreviewSize);

  // Theme selection event listeners
  colorOptions.forEach(option => {
    option.addEventListener("click", () => {
      const theme = option.getAttribute("data-theme") as ThemeType;
      if (theme === 'custom') {
        showColorPicker();
      } else {
        applyTheme(theme);
      }
    });
  });

  // Format selection event listeners
  formatOptions.forEach(option => {
    option.addEventListener("click", () => {
      const format = option.getAttribute("data-format") as FormatType;
      setActiveFormat(format);
      state.format = format;
      // If we already have processed results, update the format
      if (state.status === 'complete') {
        updateOutputFormat(format);
      }
    });
  });

  // Color picker modal events
  applyCustomColorBtn.addEventListener("click", applyCustomColor);
  cancelCustomColorBtn.addEventListener("click", hideColorPicker);

  // File handling functions
  function handleFileChange(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    const file = files ? files[0] : null;

    if (file) {
      state.file = file;
      displayFileDetails(file);
      previewImage(file);
      updateUIState();
    } else {
      resetDisplay();
    }
  }

  function displayFileDetails(file: File) {
    // Update state classes
    fileDetails.classList.remove("state-empty");

    // Update file info display
    const fileNameElement = fileDetails.querySelector(".file-name") as HTMLSpanElement;
    const fileSizeElement = fileDetails.querySelector(".file-size") as HTMLSpanElement;
    const emptyStateElement = fileDetails.querySelector(".empty-state") as HTMLDivElement;
    const fileInfoElement = fileDetails.querySelector(".file-info") as HTMLDivElement;

    fileNameElement.textContent = file.name;
    fileSizeElement.textContent = formatBytes(file.size);

    emptyStateElement.style.display = "none";
    fileInfoElement.style.display = "block";

    // Show file upload animation
    const progressContainer = fileDetails.querySelector(".progress-container") as HTMLDivElement;
    const progressBar = fileDetails.querySelector(".progress-bar") as HTMLDivElement;

    progressContainer.style.display = "block";
    progressBar.style.width = "0%";

    // Animate progress bar
    setTimeout(() => {
      progressBar.style.width = "100%";
    }, 50);

    // Hide progress bar after animation
    setTimeout(() => {
      progressContainer.style.display = "none";
    }, 1000);
  }

  function previewImage(file: File) {
    emptyState.style.display = "none";

    const reader = new FileReader();
    reader.onload = (e) => {
      imgElement.src = (e.target as FileReader).result as string;
      imgElement.classList.remove("hidden");

      // Set up page controls for multi-page documents (e.g., TIFF, PDF)
      if (file.type === 'application/pdf' || file.type === 'image/tiff') {
        // Just a mock-up since actual TIFF/PDF parsing would require additional libraries
        state.totalPages = file.type === 'application/pdf' ? 3 : 2; // Mock values
        state.currentPage = 0;
        updatePageControls();
        pageControls.style.opacity = "1";
      } else {
        state.totalPages = 1;
        state.currentPage = 0;
        pageControls.style.opacity = "0";
      }
    };
    reader.readAsDataURL(file);
  }

  function resetDisplay() {
    // Reset state
    state.file = null;
    state.currentPage = 0;
    state.totalPages = 0;
    state.status = 'ready';

    // Reset UI
    fileDetails.classList.add("state-empty");
    const emptyStateElement = fileDetails.querySelector(".empty-state") as HTMLDivElement;
    const fileInfoElement = fileDetails.querySelector(".file-info") as HTMLDivElement;

    emptyStateElement.style.display = "flex";
    fileInfoElement.style.display = "none";

    // Reset image preview
    imgElement.src = "";
    imgElement.classList.add("hidden");
    emptyState.style.display = "flex";
    pageControls.style.opacity = "0";

    // Reset buttons
    processButton.disabled = true;
    downloadButton.disabled = true;
    copyButton.disabled = true;

    // Reset OCR output
    ocrTextarea.value = "";
    statusText.textContent = "Ready";
  }

  function navigatePage(direction: number) {
    if (!state.file) return;

    const newPage = state.currentPage + direction;
    if (newPage >= 0 && newPage < state.totalPages) {
      state.currentPage = newPage;
      // In a real app, this would load the specific page from a PDF/TIFF
      // For this demo, we just update the page info
      updatePageControls();
    }
  }

  function updatePageControls() {
    pageInfo.textContent = `Page ${state.currentPage + 1} of ${state.totalPages}`;
    prevPageBtn.disabled = state.currentPage === 0;
    nextPageBtn.disabled = state.currentPage === state.totalPages - 1;
  }

  function processImage() {
    if (!state.file) return;

    // Update status
    state.status = 'processing';
    updateUIState();

    // Simulate processing delay
    setTimeout(() => {
      // Mock OCR results based on selected format
      const mockResults = generateMockResults(state.format);
      ocrTextarea.value = mockResults;

      // Update status
      state.status = 'complete';
      updateUIState();
    }, 2000);
  }

  function updateUIState() {
    // Update buttons based on state
    processButton.disabled = !state.file || state.status === 'processing';
    downloadButton.disabled = state.status !== 'complete';
    copyButton.disabled = state.status !== 'complete';

    // Update status indicator
    const statusDot = document.querySelector('.status-dot') as HTMLSpanElement;

    switch (state.status) {
      case 'ready':
        statusText.textContent = "Ready";
        statusDot.style.backgroundColor = 'var(--md-secondary)';
        break;
      case 'processing':
        statusText.textContent = "Processing...";
        statusDot.style.backgroundColor = 'var(--md-primary)';
        break;
      case 'complete':
        statusText.textContent = "Complete";
        statusDot.style.backgroundColor = 'var(--md-secondary)';
        break;
      case 'error':
        statusText.textContent = "Error";
        statusDot.style.backgroundColor = 'var(--md-error)';
        break;
    }
  }

  function generateMockResults(format: FormatType): string {
    // This would actually process the image with a VLM-OCR system
    // For now, returning mock results based on the format
    const baseText = "This is an EXPLANATION OF BENEFITS (EOB) document. Patient: John Doe, Service Date: 03/15/2023, Total Amount: $523.45";

    switch (format) {
      case 'markdown':
        return `# Explanation of Benefits\n\n**Patient:** John Doe\n**Service Date:** 03/15/2023\n**Total Amount:** $523.45\n\n## Claims Details\n\n| Service | Amount | Coverage | Patient Responsibility |\n|---------|--------|----------|------------------------|\n| Office Visit | $150.00 | $120.00 | $30.00 |\n| Lab Work | $373.45 | $320.00 | $53.45 |`;

      case 'json':
        return JSON.stringify({
          documentType: "Explanation of Benefits",
          patient: "John Doe",
          serviceDate: "03/15/2023",
          totalAmount: 523.45,
          claims: [
            { service: "Office Visit", amount: 150.00, coverage: 120.00, patientResponsibility: 30.00 },
            { service: "Lab Work", amount: 373.45, coverage: 320.00, patientResponsibility: 53.45 }
          ]
        }, null, 2);

      case 'yaml':
        return `documentType: Explanation of Benefits\npatient: John Doe\nserviceDate: 03/15/2023\ntotalAmount: 523.45\nclaims:\n  - service: Office Visit\n    amount: 150.00\n    coverage: 120.00\n    patientResponsibility: 30.00\n  - service: Lab Work\n    amount: 373.45\n    coverage: 320.00\n    patientResponsibility: 53.45`;

      default:
        return baseText;
    }
  }

  function updateOutputFormat(format: FormatType) {
    if (state.status === 'complete') {
      ocrTextarea.value = generateMockResults(format);
    }
  }

  function downloadResults() {
    if (!state.file || state.status !== 'complete') return;

    const content = ocrTextarea.value;
    const fileName = `${state.file.name.split('.')[0]}_ocr.${getFileExtension(state.format)}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function getFileExtension(format: FormatType): string {
    switch (format) {
      case 'markdown': return 'md';
      case 'json': return 'json';
      case 'yaml': return 'yml';
      default: return 'txt';
    }
  }

  function copyToClipboard() {
    if (state.status !== 'complete') return;

    ocrTextarea.select();
    document.execCommand('copy');

    // Show feedback
    const originalText = copyButton.innerHTML;
    copyButton.innerHTML = `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
    </svg>`;

    setTimeout(() => {
      copyButton.innerHTML = originalText;
    }, 2000);
  }

  // Theme functions
  function initializeTheme() {
    const savedTheme = localStorage.getItem('vlm-ocr-theme') as ThemeType || 'light';
    const savedColor = localStorage.getItem('vlm-ocr-custom-color');

    if (savedTheme === 'custom' && savedColor) {
      applyCustomTheme(savedColor);
    } else {
      applyTheme(savedTheme);
    }
  }

  function applyTheme(theme: ThemeType) {
    // Remove previous theme classes
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-custom');

    // Add new theme class
    document.body.classList.add(`theme-${theme}`);

    // Update active state on color options
    colorOptions.forEach(option => {
      if (option.getAttribute('data-theme') === theme) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });

    // Save theme preference
    localStorage.setItem('vlm-ocr-theme', theme);
  }

  function showColorPicker() {
    const currentColor = getComputedStyle(document.body).getPropertyValue('--md-primary').trim();
    colorPicker.value = rgbToHex(currentColor);
    colorPickerModal.classList.remove('hidden');
  }

  function hideColorPicker() {
    colorPickerModal.classList.add('hidden');
  }

  function applyCustomColor() {
    const color = colorPicker.value;
    applyCustomTheme(color);
    hideColorPicker();
  }

  function applyCustomTheme(color: string) {
    // Remove previous theme classes
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add('theme-custom');

    // Set custom CSS variables
    document.documentElement.style.setProperty('--md-primary', color);
    document.documentElement.style.setProperty('--md-on-primary-container', color);

    // Calculate complementary colors
    const rgb = hexToRgb(color);
    if (rgb) {
      // Generate a lighter version for the container
      const primaryContainer = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)`;
      document.documentElement.style.setProperty('--md-primary-container', primaryContainer);
    }

    // Update active state on color options
    colorOptions.forEach(option => {
      if (option.getAttribute('data-theme') === 'custom') {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });

    // Save theme preference
    localStorage.setItem('vlm-ocr-theme', 'custom');
    localStorage.setItem('vlm-ocr-custom-color', color);
  }

  function setActiveFormat(format: FormatType) {
    formatOptions.forEach(option => {
      if (option.getAttribute('data-format') === format) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  }

  // Toggle preview size function
  function togglePreviewSize() {
    isPreviewLarge = !isPreviewLarge;

    if (isPreviewLarge) {
      document.body.classList.add('preview-large');
      togglePreviewSizeBtn.title = "Reduce preview size";
      togglePreviewSizeBtn.innerHTML = `
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 16H8V19H10V14H5V16ZM8 8H5V10H10V5H8V8ZM14 19H16V16H19V14H14V19ZM16 8V5H14V10H19V8H16Z" fill="currentColor"/>
        </svg>
      `;
    } else {
      document.body.classList.remove('preview-large');
      togglePreviewSizeBtn.title = "Enlarge preview";
      togglePreviewSizeBtn.innerHTML = `
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 3H21V9H19V5.41L15.17 9.24C15.06 9.35 14.92 9.42 14.76 9.46C14.6 9.5 14.43 9.48 14.28 9.42C14.13 9.36 14 9.26 13.9 9.13C13.8 9 13.75 8.85 13.75 8.7V4H15V7.3L18.59 3.7L15 3ZM3.42 15.18L3 15.6V3H11V5H5V14.4L9.2 10.2L10.62 11.62L6.43 15.82L9 18.4V15H11V21H5L4.58 20.58L8.4 16.75L7 15.34L3.42 18.93V15.18Z" fill="currentColor"/>
        </svg>
      `;
    }

    // Save preference
    localStorage.setItem('vlm-ocr-preview-large', isPreviewLarge.toString());
  }

  // Initialize preview size from localStorage
  function initializePreviewSize() {
    const savedPreviewSize = localStorage.getItem('vlm-ocr-preview-large');
    if (savedPreviewSize === 'true') {
      isPreviewLarge = false; // Will be toggled to true in the function
      togglePreviewSize();
    }
  }

  // Call initialization for preview size
  initializePreviewSize();

  // Utility functions
  function formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  function rgbToHex(rgb: string): string {
    // Convert RGB format like 'rgb(27, 115, 232)' to hex
    const rgbMatch = rgb.match(/\d+/g);
    if (!rgbMatch || rgbMatch.length < 3) return '#1a73e8'; // Default blue

    const [r, g, b] = rgbMatch.map(Number);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
});
