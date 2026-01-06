// transactionidgenerator.js
// Utility to generate a unique transaction ID for gym transactions

export function generateTransactionId() {
  // Use current timestamp and a random 4-digit number for uniqueness
  return `TXN${Date.now()}`;
}
