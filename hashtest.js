import bcrypt from 'bcryptjs';

// Function to hash a word
const hashWord = async (word) => {
    try {
        const saltRounds = 10; // You can increase this for higher security
        const hash = bcrypt.hashSync(word, saltRounds);
        console.log(`Original Word: ${word}`);
        console.log(`Hashed Word: ${hash}`);
    } catch (error) {
        console.error('Error hashing the word:', error);
    }
};

// Get the word from command-line arguments
// const word = process.argv[2];
// if (!word) {
//     console.error('Please provide a word to hash. Example: node hash.js mypassword');
//     process.exit(1);
// }

// Hash the word
hashWord('wellsFargo123');
