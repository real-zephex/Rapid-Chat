interface CalculatorReturnProps {
  status: boolean;
  content?: string;
}

const Calculator = async ({
  expression,
}: {
  expression: string;
}): Promise<CalculatorReturnProps> => {
  try {
    // Validate input - only allow numbers, operators, parentheses, and common math functions
    const sanitized = expression
      .replace(/\s+/g, "")
      .replace(/[^0-9+\-*/().^%√πe]/g, "");

    if (!sanitized) {
      return {
        status: false,
        content: "Invalid expression. Only mathematical symbols are allowed.",
      };
    }

    // Replace common mathematical notations
    const processedExpression = sanitized
      .replace(/π/g, String(Math.PI))
      .replace(/e(?![0-9])/g, String(Math.E))
      .replace(/√(\d+)/g, "Math.sqrt($1)")
      .replace(/\^/g, "**");

    // Safely evaluate the expression using Function constructor
    // This is safer than eval() but still requires input sanitization
    const result = new Function(`return ${processedExpression}`)();

    if (typeof result !== "number" || !isFinite(result)) {
      return {
        status: false,
        content: "Invalid calculation result.",
      };
    }

    return {
      status: true,
      content: `Result: ${Number(result.toFixed(10))}`, // Limit decimal places
    };
  } catch (error) {
    return {
      status: false,
      content:
        error instanceof Error
          ? error.message
          : "An error occurred during calculation.",
    };
  }
};

export default Calculator;
