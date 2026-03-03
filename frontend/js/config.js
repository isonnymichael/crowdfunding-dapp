const contractAddress = '0x5aA6d8F2FcF3aAaba0C07f4261058CC3b54B6EDD';
const network = 'sepolia';

// Global state
let provider = ethers.getDefaultProvider(network);
let signer;
let contract;
let account;
let abi;
