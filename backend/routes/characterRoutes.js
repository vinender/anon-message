// backend/routes/api.js
const express = require('express');
const { generateCharacter } = require('../controllers/astroCharacterController');
const router = express.Router();
 
router.post('/generate-astro-character', generateCharacter);

module.exports = router;