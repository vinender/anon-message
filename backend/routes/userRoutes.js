 
 const express = require('express');
const router = express.Router();
const { getPublicKey  } = require('../controllers/authController');

router.get('/:username/public-key',getPublicKey);


module.exports = router;
