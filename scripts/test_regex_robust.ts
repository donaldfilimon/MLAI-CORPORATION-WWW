const target1 = '5B';
const target2 = '295×';

// Updated regex:
// [1] = prefix (including currency symbols)
// [2] = number
// [3] = suffix
const regex = /^([<>$]\s*)?([\d,.]+)(.*)$/;

console.log('5B:', target1.match(regex));
console.log('295×:', target2.match(regex));
