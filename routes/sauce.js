const express = require('express');
const router = express.Router(); 
const sauceCtrl = require('../controllers/sauce')
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')

router.post('/', auth, multer, sauceCtrl.addSauce);
router.get('/', auth, sauceCtrl.getAllSauce);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.put('/:id', auth, multer , sauceCtrl.modifySauce);
router.post('/:id/like', auth, sauceCtrl.likeSauce);


module.exports = router;

