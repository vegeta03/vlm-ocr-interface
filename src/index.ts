document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput") as HTMLInputElement;
  const fileDetails = document.getElementById("fileDetails") as HTMLDivElement;
  const imagePreview = document.getElementById(
    "imagePreview"
  ) as HTMLDivElement;
  const imgElement = imagePreview.querySelector("img") as HTMLImageElement;

  fileInput.addEventListener("change", (event) => {
    const files = (event.target as HTMLInputElement).files;
    const file = files ? files[0] : null;
    if (file) {
      displayFileDetails(file);
      previewImage(file);
    } else {
      resetDisplay();
    }
  });

  function displayFileDetails(file: File) {
    fileDetails.textContent = `File name: ${file.name}, size: ${formatBytes(
      file.size
    )}`;
  }

  function previewImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imgElement.src = (e.target as FileReader).result as string;
      imgElement.style.display = "block";
    };
    reader.readAsDataURL(file);
  }

  function resetDisplay() {
    fileDetails.textContent = "No file selected";
    imgElement.src = "";
    imgElement.style.display = "none";
  }

  function formatBytes(bytes: number, decimals: number = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
});
