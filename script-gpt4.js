const sectionMessages = document.querySelector("#messages");
const inputMessage = document.querySelector("#message");
const buttonMessage = document.querySelector("#send-message");

const model = "gpt-4";
const BASE_URL = `https://api.openai.com/v1/chat/completions`;
const API_KEY = "";

document.querySelector("#model-text").innerText = model;

document
  .querySelector("form")
  .addEventListener("submit", (e) => e.preventDefault());

inputMessage.addEventListener("keyup", (event) => {
  const hasValue = inputMessage.value !== ""; // true or false

  buttonMessage.classList.toggle("color-white", hasValue);
  buttonMessage.classList.toggle("color-gray", !hasValue);
  buttonMessage.disabled = !hasValue;

  if (hasValue && event.key === "Enter") {
    event.preventDefault();
    insertMessageInHTML();
  }
});

buttonMessage.addEventListener("click", insertMessageInHTML);

async function insertMessageInHTML() {
  sectionMessages.innerHTML += `
  <p><span class="text-bold"> You: </span> ${inputMessage.value} </p>
  `;

  const responseGPT = await postMessageGPT(inputMessage.value);
  sectionMessages.innerHTML += `
  <p><span class="text-bold"> chatGPT: </span> ${responseGPT} </p>
  `;

  inputMessage.value = "";
  resetButtonState();
}

function resetButtonState() {
  buttonMessage.classList.remove("color-white");
  buttonMessage.classList.add("color-gray");
  buttonMessage.disabled = true;
}

async function postMessageGPT(message) {
  const data = {
    messages: [
      {
        content: message,
        role: "system",
      },
    ],
    model: model,
    temperature: 0.2,
    max_tokens: 2000,
    top_p: 1,
    frequency_penalty: 0.5,
    presence_penalty: 0,
  };

  showLoadingIndicator();

  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(data),
    });

    const returnResponseJson = await response.json();
    return returnResponseJson.choices[0].message.content;
  } catch (error) {
    console.error("Erro na requisição:", error.message);
    return error.message;
  } finally {
    hideLoadingIndicator();
  }
}

function showLoadingIndicator() {
  const loadingElement = document.createElement("div");
  loadingElement.className = "lds-ellipsis";
  loadingElement.innerHTML = "<div></div><div></div><div></div><div></div>";
  sectionMessages.appendChild(loadingElement);
}

function hideLoadingIndicator() {
  const loadingElement = sectionMessages.querySelector(".lds-ellipsis");
  if (loadingElement) loadingElement.remove();
}
