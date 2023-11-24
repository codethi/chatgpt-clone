const sectionMessages = document.querySelector("#messages");
const inputMessage = document.querySelector("#message");
const buttonMessage = document.querySelector("#send-message");
const selectModel = document.querySelector("#models");
const formMessage = document.querySelector("form");

const BASE_URL = "https://api.openai.com/v1/chat/completions";
const API_KEY = "";
let model = selectModel.value;

selectModel.addEventListener("change", () => {
  model = selectModel.value;
});
formMessage.addEventListener("submit", (e) => e.preventDefault());
buttonMessage.addEventListener("click", insertMessageInHTML);

inputMessage.addEventListener("keyup", (event) => {
  const hasValue = inputMessage.value !== "";

  buttonMessage.classList.toggle("color-white", hasValue);
  buttonMessage.classList.toggle("color-gray", !hasValue);
  buttonMessage.disabled = !hasValue;

  if (hasValue && event.key === "Enter") {
    event.preventDefault();
    insertMessageInHTML();
  }
});

async function insertMessageInHTML() {
  const userInputMessage = inputMessage.value;

  sectionMessages.innerHTML += `
    <div class="image-name">
      <i class="bi bi-person-circle"></i>
      <h4>You</h4>
    </div>
    <p class="message-p"> ${userInputMessage} </p>
  `;

  formMessage.reset();
  resetButtonState();

  const responseGPT = await postMessageGPT(userInputMessage);
  sectionMessages.innerHTML += `
    <div class="image-name">
      <img src="./icon.webp">
      <h4>ChatGPT</h4>
    </div>
    <p class="message-p"> ${responseGPT} </p>
  `;
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

// Se quiser pegar todas as models existentes no GPT, use o código abaixo:

/*
async function getAllModels() {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    const returnResponseJson = await response.json();
    return returnResponseJson;
  } catch (error) {
    console.error("Erro na requisição:", error.message);
    return error.message;
  } finally {
    hideLoadingIndicator();
  }
}

getAllModels().then(res => console.log(res))
*/
