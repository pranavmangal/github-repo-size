const INPUT_ID = "gh-access-token";
const GH_TOKEN_KEY = "grsToken";

async function verifyToken(token) {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to verify token");
  }

  const data = await response.json();
  return data.login;
}

function setIntermediate(feedbackElem, usernameElem) {
  feedbackElem.textContent = "Verifying token...";
  feedbackElem.className = "feedback";
  usernameElem.textContent = "";
}

function setSuccess(feedbackElem, usernameElem, username) {
  feedbackElem.textContent = "Token saved successfully!";
  feedbackElem.className = "feedback success";
  usernameElem.textContent = `GitHub Username: ${username}`;
}

function setError(feedbackElem, usernameElem) {
  feedbackElem.textContent =
    "Error: Invalid token. Please check and try again.";
  feedbackElem.className = "feedback error";
  usernameElem.textContent = "";
}

async function verifyTokenAndSave() {
  const token = document.getElementById(INPUT_ID).value;
  const feedbackElem = document.getElementById("feedback");
  const usernameElem = document.getElementById("username");

  setIntermediate(feedbackElem, usernameElem);

  try {
    const username = await verifyToken(token);
    browser.storage.sync.set(
      { [GH_TOKEN_KEY]: token },
      setSuccess(feedbackElem, usernameElem, username)
    );
  } catch (error) {
    setError(feedbackElem, usernameElem);
    document.getElementById(INPUT_ID).value = "";
  }
}

function fetchToken(result) {
  if (result[GH_TOKEN_KEY]) {
    document.getElementById(INPUT_ID).value = result[GH_TOKEN_KEY];
  }
}

function setClear(feedbackElem, usernameElem) {
  feedbackElem.textContent = "Token cleared successfully!";
  feedbackElem.className = "feedback success";
  usernameElem.textContent = "";
}

function clearToken() {
  browser.storage.sync.remove(GH_TOKEN_KEY, function () {
    document.getElementById(INPUT_ID).value = "";
    setClear(
      document.getElementById("feedback"),
      document.getElementById("username")
    );
  });
}

document.getElementById("clear-btn").addEventListener("click", clearToken);

document
  .getElementById("save-btn")
  .addEventListener("click", verifyTokenAndSave);

browser.storage.sync.get([GH_TOKEN_KEY], fetchToken);
