export const textToNumber = (str) => {
    // First, determine if it's likely a European or US format
    const hasComma = str.includes(',');
    const hasPeriod = str.includes('.');
    try {
        // Case 1: European format (1.234,56 or 569,00)
        if ((hasComma && hasPeriod && str.lastIndexOf(',') > str.lastIndexOf('.')) || (hasComma && !hasPeriod)) {
            // Replace all periods (thousand separators), then replace comma with decimal point
            return parseFloat(str.replace(/\./g, '').replace(',', '.'));
        }
        // Case 2: US format (1,234.56 or 569.00)
        else {
            // Replace all commas (thousand separators), decimal point remains
            return parseFloat(str.replace(/,/g, ''));
        }
    } catch (error) {
        console.error('Error converting text to number. return value is zero', error);
        return -1; // or handle the error as needed
    }
};
// Now with the correct function name:
// console.log(textToNumber('1,234.56')); // Output: 1234.56 (US format)
// console.log(textToNumber('1.234,56')); // Output: 1234.56 (European format)
