exports.assertEquals = (actual, expected, message = '') => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Assertion Failed: ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
  }
  console.log(`PASS: ${message}`);
};

exports.assertAsync = async (fn, message = '') => {
  try {
    await fn();
    console.log(`PASS: ${message}`);
  } catch (error) {
    throw new Error(`Async Assertion Failed: ${message}\n${error.stack}`);
  }
};

exports.assertThrows = async (fn, message = '') => {
  try {
    await fn();
  } catch (error) {
    console.log(`PASS: ${message} (threw as expected)`);
    return;
  }
  throw new Error(`Assertion Failed: ${message} (expected to throw but did not)`);
};
