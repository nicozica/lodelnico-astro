// Test the new 24-hour format
import { formatDateTime } from './src/utils/formatDateTime.ts';

// Simulate the same date as in the example
const testDate = '2025-08-28T06:25:00.000Z';

console.log('Testing new 24-hour format:');
console.log('Input:', testDate);
console.log('Output:', formatDateTime(testDate));

// Test another time to see the difference
const afternoonDate = '2025-08-28T18:30:00.000Z';
console.log('\nTesting afternoon time:');
console.log('Input:', afternoonDate);
console.log('Output:', formatDateTime(afternoonDate));
