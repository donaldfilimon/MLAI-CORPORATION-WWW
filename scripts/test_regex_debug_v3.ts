const target = "5B";

// Permissive regex for prefix
const regex = /^([<>$]\s*|[\d,.]+)?([\d,.]+)(\+?%?\s*.*)$/;

const match = target.match(regex);
console.log('Target:', target);
console.log('Match:', match);
