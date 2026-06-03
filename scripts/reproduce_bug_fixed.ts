const target1 = '5B';
const target2 = 'M';

// Updated regex logic from Stats.tsx
const regex = /^([<>$]\s*)?([\d,.]+)(\+?%?\s*.*)$/;

console.log('Testing 5B...');
const match1 = target1.match(regex);
console.log('Match:', match1);

console.log('Testing M...');
const match2 = target2.match(regex);
console.log('Match:', match2);

if (!match1 || !match2) {
  console.error('Failed to match!');
  process.exit(1);
} else {
  console.log('Successfully matched!');
}
