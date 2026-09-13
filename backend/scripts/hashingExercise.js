// PRACTICE EXERCISE — Student 5 (Backend & Data Storage)
//
// This file is NOT wired into the running app. It exists so you can
// practice password hashing risk-free before confirming your
// understanding against the real (already-complete) code in
// backend/routes/auth.js.
//
// Why is this separate? Password hashing is one of the few things in
// this project where a mistake has real consequences — if it were left
// broken in the live app, real user passwords could end up stored
// unsafely. So the actual app already hashes correctly. Here, you
// practice the same three calls yourself.
//
// Follow docs/backend-storage.md ("Password Hashing") step by step,
// then fill in the two functions below. Run this file directly with:
//   node backend/scripts/hashingExercise.js
// to see if your output matches what's expected.

const bcrypt = require('bcryptjs');

async function hashPassword(plainTextPassword) {
  // TODO: Generate a salt with bcrypt.genSalt(10), then hash the
  // password with that salt using bcrypt.hash(). Return the hash.
  throw new Error('hashPassword is not implemented yet');
}

async function checkPassword(plainTextPassword, storedHash) {
  // TODO: Use bcrypt.compare() to check whether plainTextPassword
  // matches storedHash. Return true or false.
  throw new Error('checkPassword is not implemented yet');
}

// --- Self-check when run directly (node backend/scripts/hashingExercise.js) ---
async function selfCheck() {
  try {
    const hash = await hashPassword('correct-horse-battery-staple');
    console.log('Hash produced:', hash);

    const shouldBeTrue = await checkPassword('correct-horse-battery-staple', hash);
    const shouldBeFalse = await checkPassword('wrong-password', hash);

    console.log('Correct password matches:', shouldBeTrue, shouldBeTrue === true ? '✅' : '❌ should be true');
    console.log('Wrong password matches:', shouldBeFalse, shouldBeFalse === false ? '✅' : '❌ should be false');
  } catch (err) {
    console.log('Not implemented yet:', err.message);
  }
}

if (require.main === module) {
  selfCheck();
}

module.exports = { hashPassword, checkPassword };
