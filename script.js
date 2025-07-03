function compileCode() {
  const code = document.getElementById("editor").value;
  const langId = document.getElementById("language").value;
  const outputBox = document.getElementById("output");

  if (!code.trim()) {
    outputBox.textContent = "Please write some code.";
    return;
  }

  outputBox.textContent = "Compiling your code...";

  const payload = {
    code: code,
    langId: langId
  };

 
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "https://course.codequotient.com/api/executeCode", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      const response = JSON.parse(xhr.responseText);
      if (response.error) {
        outputBox.textContent = "Error: " + response.error;
      } else {
        const codeId = response.codeId;
        pollResult(codeId);  
      }
    }
  };
  xhr.send(JSON.stringify(payload));
}

function pollResult(codeId) {
  const outputBox = document.getElementById("output");

  const interval = setInterval(() => {
    fetch(`https://course.codequotient.com/api/codeResult/${codeId}`)
      .then(res => res.json())
      .then(result => {
        console.log("Raw result:", result);

        if (result.data && typeof result.data === "string") {
          const parsedData = JSON.parse(result.data); 
          console.log("Parsed result:", parsedData);

          clearInterval(interval);

          const rawOutput = parsedData.output || "";
          const errors = parsedData.errors?.trim();

          const output = rawOutput.replace("OUTPUT:", "").trim();

          if (errors) {
            outputBox.textContent = "Error:\n" + errors;
          } else if (output) {
            outputBox.textContent = "Output:\n" + output;
          } else {
            outputBox.textContent = " Output is empty.";
          }
        }
      })
      .catch(err => {
        clearInterval(interval);
        outputBox.textContent = " Error: " + err.message;
      });
  }, 5000);
}