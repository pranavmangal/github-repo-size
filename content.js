const fileZipSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="octicon octicon-file-zip mr-2" viewBox="0 0 16 16" width="16" height="16"><path d="M3.5 1.75v11.5c0 .09.048.173.126.217a.75.75 0 0 1-.752 1.298A1.748 1.748 0 0 1 2 13.25V1.75C2 .784 2.784 0 3.75 0h5.586c.464 0 .909.185 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v8.586A1.75 1.75 0 0 1 12.25 15h-.5a.75.75 0 0 1 0-1.5h.5a.25.25 0 0 0 .25-.25V4.664a.25.25 0 0 0-.073-.177L9.513 1.573a.25.25 0 0 0-.177-.073H7.25a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5h-3a.25.25 0 0 0-.25.25Zm3.75 8.75h.5c.966 0 1.75.784 1.75 1.75v3a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1-.75-.75v-3c0-.966.784-1.75 1.75-1.75ZM6 5.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 6 5.25Zm.75 2.25h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM8 6.75A.75.75 0 0 1 8.75 6h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 8 6.75ZM8.75 3h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM8 9.75A.75.75 0 0 1 8.75 9h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 8 9.75Zm-1 2.5v2.25h1v-2.25a.25.25 0 0 0-.25-.25h-.5a.25.25 0 0 0-.25.25Z"></path></svg>`;

function sizeFormat(sizeInKB) {
  if (sizeInKB < 1024) return [sizeInKB, "KB"];

  sizeInKB /= 1024;
  if (sizeInKB < 1024) return [sizeInKB.toFixed(2), "MB"];

  sizeInKB /= 1024;
  return [sizeInKB.toFixed(2), "GB"];
}

function repoSizeElement(value, unit) {
  const sizeContainer = document.createElement("div");
  sizeContainer.className = "mt-2";

  const anchor = document.createElement("a");
  anchor.className = "Link--muted";

  const valueElem = document.createElement("strong");
  valueElem.textContent = ` ${value}`;

  anchor.innerHTML = fileZipSVG;
  anchor.appendChild(valueElem);
  anchor.appendChild(document.createTextNode(` ${unit}`));

  sizeContainer.appendChild(anchor);

  return sizeContainer;
}

(function () {
  const pathParts = window.location.pathname.split("/");

  // Check if the URL matches the GitHub repo format
  if (pathParts.length === 3 && pathParts[1] && pathParts[2]) {
    const username = pathParts[1];
    const reponame = pathParts[2];

    const apiUrl = `https://api.github.com/repos/${username}/${reponame}`;

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response error");
        }

        return response.json();
      })
      .then((data) => {
        const repoSize = data.size;
        const [val, unit] = sizeFormat(repoSize);

        const sidebarForksElem = document
          .querySelector(".BorderGrid .octicon-repo-forked")
          .closest(".mt-2");

        if (sidebarForksElem) {
          const sizeElem = repoSizeElement(val, unit);

          sidebarForksElem.parentNode.insertBefore(
            sizeElem,
            sidebarForksElem.nextSibling
          );
        }
      })
      .catch((error) => {
        console.error("Unable to fetch repo size", error);
      });
  }
})();
