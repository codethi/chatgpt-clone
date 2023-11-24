const sectionMessages = document.querySelector("#messages");
const inputMessage = document.querySelector("#message");
const buttonMessage = document.querySelector("#send-message");
const selectModel = document.querySelector("#models");

const BASE_URL = "https://api.openai.com/v1";
const API_KEY = "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";
let model = selectModel.value;
let GPT_URI;

updateGptUri();

selectModel.addEventListener("change", () => {
  model = selectModel.value;
  updateGptUri();
});

function updateGptUri() {
  GPT_URI = modelValidation()
    ? `${BASE_URL}/chat/completions`
    : `${BASE_URL}/engines/${model}/completions`;
}

function modelValidation() {
  return (
    model.includes(4) ||
    !model.includes("instruct") &&
    !model.includes("davinci")
  );
}

document
  .querySelector("form")
  .addEventListener("submit", (e) => e.preventDefault());

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

buttonMessage.addEventListener("click", insertMessageInHTML);

async function insertMessageInHTML() {
  const yourMessage = `<p> <span class="text-bold"> You: </span> ${inputMessage.value} </p>`;
  sectionMessages.innerHTML += yourMessage;
  const responseGPT = await postMessageGPT(inputMessage.value);

  inputMessage.value = "";
  resetButtonState();

  const chatGPTMessage = `<p> <span class="text-bold"> ChatGPT: </span> ${responseGPT} </p>`;
  sectionMessages.innerHTML += chatGPTMessage;
}

function resetButtonState() {
  buttonMessage.classList.remove("color-white");
  buttonMessage.classList.add("color-gray");
  buttonMessage.disabled = true;
}

async function postMessageGPT(message) {
  const prefixData = modelValidation()
    ? {
        messages: [
          {
            content: message,
            role: "system",
          },
        ],
        model: model,
      }
    : { prompt: `${message}` };

  const data = {
    ...prefixData,
    temperature: 0.2,
    max_tokens: 2000,
    top_p: 1,
    frequency_penalty: 0.5,
    presence_penalty: 0,
  };

  showLoadingIndicator();

  try {
    const response = await fetch(GPT_URI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(data),
    });

    const returnResponseJson = await response.json();
    const result = modelValidation()
      ? returnResponseJson.choices[0].message.content
      : returnResponseJson.choices[0].text;
    return result;
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