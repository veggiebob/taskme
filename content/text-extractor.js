export function getSelectedText() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return "";
  }
  return selection.toString().trim();
}

export function inferContextualDetails() {
  const title = document.title;
  const url = location.href;
  return {
    pageTitle: title,
    pageUrl: url,
  };
}

export default {
  getSelectedText,
  inferContextualDetails,
};
