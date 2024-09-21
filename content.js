const tokenStorageKey = "grsToken";

const listSizeElemId = "gh-repo-size-list";
const sideBarSizeElemId = "gh-repo-size-sidebar";

function fileZipSVG(forSidebar) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute(
    "class",
    `octicon octicon-file-zip ${forSidebar ? "mr-2" : "mr-1"}`
  );
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute(
    "d",
    "M3.5 1.75v11.5c0 .09.048.173.126.217a.75.75 0 0 1-.752 1.298A1.748 1.748 0 0 1 2 13.25V1.75C2 .784 2.784 0 3.75 0h5.586c.464 0 .909.185 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v8.586A1.75 1.75 0 0 1 12.25 15h-.5a.75.75 0 0 1 0-1.5h.5a.25.25 0 0 0 .25-.25V4.664a.25.25 0 0 0-.073-.177L9.513 1.573a.25.25 0 0 0-.177-.073H7.25a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5h-3a.25.25 0 0 0-.25.25Zm3.75 8.75h.5c.966 0 1.75.784 1.75 1.75v3a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1-.75-.75v-3c0-.966.784-1.75 1.75-1.75ZM6 5.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 6 5.25Zm.75 2.25h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM8 6.75A.75.75 0 0 1 8.75 6h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 8 6.75ZM8.75 3h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM8 9.75A.75.75 0 0 1 8.75 9h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 8 9.75Zm-1 2.5v2.25h1v-2.25a.25.25 0 0 0-.25-.25h-.5a.25.25 0 0 0-.25.25Z"
  );

  svg.appendChild(path);
  return svg;
}

function sizeFormat(sizeInKB) {
  if (sizeInKB < 1024) return [sizeInKB, "KB"];

  sizeInKB /= 1024;
  if (sizeInKB < 1024) return [sizeInKB.toFixed(2), "MB"];

  sizeInKB /= 1024;
  return [sizeInKB.toFixed(2), "GB"];
}

function listRepoSize(value, unit) {
  const anchor = document.createElement("a");
  anchor.id = listSizeElemId;
  anchor.className = "Link--secondary no-underline d-block mr-2";

  const valueElem = document.createElement("strong");
  valueElem.className = "color-fg-default";
  valueElem.textContent = ` ${value}`;

  const unitElem = document.createElement("span");
  unitElem.className = "color-fg-muted";
  unitElem.textContent = ` ${unit}`;

  anchor.appendChild(fileZipSVG({ forSidebar: false }));
  anchor.appendChild(valueElem);
  anchor.appendChild(unitElem);

  return anchor;
}

function addToDetailsList(value, unit) {
  const sizeElem = document.getElementById(listSizeElemId);
  if (sizeElem) return;

  const activity = document
    .querySelector(".Link--secondary .octicon-pulse")
    .closest("a");

  if (activity) {
    const sizeElem = listRepoSize(value, unit);
    activity.parentNode.insertBefore(sizeElem, activity);
  }
}

function sidebarRepoSize(value, unit) {
  const sizeContainer = document.createElement("div");
  sizeContainer.id = sideBarSizeElemId;
  sizeContainer.className = "mt-2";

  const anchor = document.createElement("a");
  anchor.className = "Link Link--muted";

  const valueElem = document.createElement("strong");
  valueElem.textContent = ` ${value}`;

  anchor.appendChild(fileZipSVG({ forSidebar: true }));
  anchor.appendChild(valueElem);
  anchor.appendChild(document.createTextNode(` ${unit}`));

  sizeContainer.appendChild(anchor);

  return sizeContainer;
}

function addToSidebar(value, unit) {
  const sizeElem = document.getElementById(sideBarSizeElemId);
  if (sizeElem) return;

  const forks = document
    .querySelector(".BorderGrid .octicon-repo-forked")
    .closest(".mt-2");

  if (forks) {
    const sizeElem = sidebarRepoSize(value, unit);
    forks.parentNode.insertBefore(sizeElem, forks.nextSibling);
  }
}

function getGitHubAccessToken() {
  return new Promise((resolve) => {
    browser.storage.sync.get(tokenStorageKey, function (result) {
      resolve(result[tokenStorageKey]);
    });
  });
}

async function fetchRepoSize(username, reponame) {
  const token = await getGitHubAccessToken();
  const apiUrl = `https://api.github.com/repos/${username}/${reponame}`;

  const headers = { Accept: "application/vnd.github.v3+json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(apiUrl, { headers });
    if (!response.ok) {
      switch (response.status) {
        case 403:
          throw new Error("Forbidden to access this GitHub repository");
        case 404:
          throw new Error("The GitHub repository was not found");
        default:
          throw new Error(`Network response error: ${response.status}`);
      }
    }

    const data = await response.json();
    return data.size;
  } catch (error) {
    console.error("Unable to fetch repository size:", error);
    return null;
  }
}

async function init() {
  const pathParts = window.location.pathname.split("/");

  // Check if the URL matches the GitHub repo format
  if (pathParts.length === 3 && pathParts[1] && pathParts[2]) {
    const username = pathParts[1];
    const reponame = pathParts[2];

    const repoSize = await fetchRepoSize(username, reponame);
    if (repoSize != null) {
      const [val, unit] = sizeFormat(repoSize);

      // Desktop view
      addToSidebar(val, unit);
      // Mobile view
      addToDetailsList(val, unit);
    }
  }
}

init();

let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    init();
  }
}).observe(document, { subtree: true, childList: true });
