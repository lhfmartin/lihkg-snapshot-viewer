export default (html: string) => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  let result = textarea.value;
  textarea.remove();
  return result;
};
