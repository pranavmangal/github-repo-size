const fileZipSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="octicon octicon-file-zip mr-2" viewBox="0 0 16 16" width="16" height="16"><path d="M3.5 1.75v11.5c0 .09.048.173.126.217a.75.75 0 0 1-.752 1.298A1.748 1.748 0 0 1 2 13.25V1.75C2 .784 2.784 0 3.75 0h5.586c.464 0 .909.185 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v8.586A1.75 1.75 0 0 1 12.25 15h-.5a.75.75 0 0 1 0-1.5h.5a.25.25 0 0 0 .25-.25V4.664a.25.25 0 0 0-.073-.177L9.513 1.573a.25.25 0 0 0-.177-.073H7.25a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5h-3a.25.25 0 0 0-.25.25Zm3.75 8.75h.5c.966 0 1.75.784 1.75 1.75v3a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1-.75-.75v-3c0-.966.784-1.75 1.75-1.75ZM6 5.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 6 5.25Zm.75 2.25h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM8 6.75A.75.75 0 0 1 8.75 6h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 8 6.75ZM8.75 3h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM8 9.75A.75.75 0 0 1 8.75 9h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 8 9.75Zm-1 2.5v2.25h1v-2.25a.25.25 0 0 0-.25-.25h-.5a.25.25 0 0 0-.25.25Z"></path></svg>`;

function formatSize(sizeInKB) {
  if (sizeInKB < 1024) {
    return [sizeInKB, "KB"];
  } else if (sizeInKB < 1024 * 1024) {
    return [(sizeInKB / 1024).toFixed(2), "MB"];
  } else {
    return [(sizeInKB / 1024 / 1024).toFixed(2), "GB"];
  }
}

function sizeElement(value, unit) {
  const newDiv = document.createElement("div");
  newDiv.className = "mt-2";

  const newAnchor = document.createElement("a");
  newAnchor.className = "Link--muted";
  newAnchor.href = ""; // No href

  const strongElement = document.createElement("strong");
  strongElement.textContent = ` ${value}`;

  newAnchor.innerHTML = fileZipSVG;
  newAnchor.appendChild(strongElement);
  newAnchor.appendChild(document.createTextNode(` ${unit}`));

  newDiv.appendChild(newAnchor);

  return newDiv;
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
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        const size = data.size;
        const [val, unit] = formatSize(size);

        const sidebarDivs = document.querySelectorAll("div.mt-2");

        if (sidebarDivs.length > 0) {
          const lastDiv = sidebarDivs[sidebarDivs.length - 1];

          const sizeElem = sizeElement(val, unit);
          lastDiv.parentNode.insertBefore(sizeElem, lastDiv);
        }
      })
      .catch((error) => {
        // Log errors in the console
        console.error("There was a problem with the fetch operation:", error);
      });
  }
})();
