const { capitalizeEveryWord, capitalizeFirstLetter } = require("../plugins/utils.js");

function testCapitalizeFirstLetter() {
  console.log("Testing capitalizeFirstLetter...");
  const cases = [
    { input: "hello", expected: "Hello" },
    { input: "world", expected: "World" },
    { input: "", expected: "" },
    { input: "a", expected: "A" },
  ];

  cases.forEach(({ input, expected }) => {
    const result = capitalizeFirstLetter(input);
    if (result === expected) {
      console.log(`✅ PASS: "${input}" -> "${result}"`);
    } else {
      console.error(`❌ FAIL: "${input}" -> expected "${expected}", got "${result}"`);
      process.exit(1);
    }
  });
}

function testCapitalizeEveryWord() {
  console.log("\nTesting capitalizeEveryWord...");
  const cases = [
    { input: "hello world", expected: "Hello World" },
    { input: "hello  world", expected: "Hello  World" },
    { input: "multiple words in a sentence", expected: "Multiple Words In A Sentence" },
    { input: "already Capitalized", expected: "Already Capitalized" },
    { input: "  leading and trailing  ", expected: "  Leading And Trailing  " },
    { input: "", expected: "" },
    { input: "123 numbers", expected: "123 Numbers" },
  ];

  cases.forEach(({ input, expected }) => {
    const result = capitalizeEveryWord(input);
    if (result === expected) {
      console.log(`✅ PASS: "${input}" -> "${result}"`);
    } else {
      console.error(`❌ FAIL: "${input}" -> expected "${expected}", got "${result}"`);
      process.exit(1);
    }
  });
}

try {
  testCapitalizeFirstLetter();
  testCapitalizeEveryWord();
  console.log("\nAll tests passed! 🎉");
} catch (error) {
  console.error("An error occurred during testing:", error);
  process.exit(1);
}
