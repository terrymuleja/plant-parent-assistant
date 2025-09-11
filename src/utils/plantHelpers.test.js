// Extract this function from your PlantDetailScreen
const getTimeDisplay = (lastCareTime) => {
  if (!lastCareTime) return 'Never';
  
  const now = Date.now();
  const careTime = new Date(lastCareTime).getTime();
  const diffMs = now - careTime;
  
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
};

// Tests
const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

console.log('Testing time display:');
console.log('Never:', getTimeDisplay(null) === 'Never' ? 'PASS' : 'FAIL');
console.log('1 day ago:', getTimeDisplay(daysAgo(1)) === '1 day ago' ? 'PASS' : 'FAIL');
console.log('8 days ago:', getTimeDisplay(daysAgo(8)) === '1 week ago' ? 'PASS' : 'FAIL');
console.log('15 days ago:', getTimeDisplay(daysAgo(15)) === '2 weeks ago' ? 'PASS' : 'FAIL');
console.log('1 hour ago:', getTimeDisplay(new Date(Date.now() - 60 * 60 * 1000).toISOString()) === '1 hour ago' ? 'PASS' : 'FAIL');
console.log('30 minutes ago:', getTimeDisplay(new Date(Date.now() - 30 * 60 * 1000).toISOString()) === '30 minutes ago' ? 'PASS' : 'FAIL');
console.log('Just now:', getTimeDisplay(new Date(Date.now() - 30 * 1000).toISOString()) === 'Just now' ? 'PASS' : 'FAIL');
