// transactionidgenerator.js
// Utility to generate a unique transaction ID for gym transactions

export function generateTransactionId() {
  // Use current timestamp and a random 4-digit number for uniqueness
  const now = new Date();
  const timestamp = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0') +
    now.getMilliseconds().toString().padStart(3, '0');
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `TXN${timestamp}${random}`;
}
