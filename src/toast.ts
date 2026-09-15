const toast = document.getElementById("toast");

export function showToast(message: string): void {
  if (!toast) return;
  toast.textContent = message;
  toast.style.display = "block";
  window.setTimeout(() => {
    toast.style.display = "none";
  }, 2500);
}
