interface CodeExecutorReturnProps {
  status: boolean;
  content?: string;
}

const CodeExecutor = async ({
  code,
  language,
}: {
  code: string;
  language: string;
}): Promise<CodeExecutorReturnProps> => {
  try {
    if (!code || code.trim().length === 0) {
      return {
        status: false,
        content: "No code provided for execution.",
      };
    }

    const supportedLanguages = ["javascript", "python", "typescript"];

    if (!supportedLanguages.includes(language.toLowerCase())) {
      return {
        status: false,
        content: `Unsupported language: ${language}. Supported languages: ${supportedLanguages.join(
          ", "
        )}`,
      };
    }

    // Using Piston API for code execution (free, open-source)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: language.toLowerCase(),
        version: "*", // Use latest version
        files: [
          {
            name: `main.${
              language === "python"
                ? "py"
                : language === "typescript"
                ? "ts"
                : "js"
            }`,
            content: code,
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return {
        status: false,
        content: "Code execution service is currently unavailable.",
      };
    }

    const result = await response.json();

    if (result.compile && result.compile.stderr) {
      return {
        status: false,
        content: `Compilation Error:\n${result.compile.stderr}`,
      };
    }

    if (result.run && result.run.stderr) {
      const output = [
        "Output:",
        result.run.stdout || "(no output)",
        "",
        "Errors:",
        result.run.stderr,
      ].join("\n");
      return {
        status: true,
        content: output,
      };
    }

    return {
      status: true,
      content:
        result.run?.stdout || "Code executed successfully with no output.",
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        status: false,
        content: "Code execution timed out (15s limit).",
      };
    }
    return {
      status: false,
      content:
        error instanceof Error
          ? error.message
          : "An error occurred during code execution.",
    };
  }
};

export default CodeExecutor;
