import express from 'express'
import user_Act from './../controllers/users.js'
const router = express.Router();

router.get('/', user_Act.getUser);
router.get('/:email', user_Act.getSpecUser);
router.post('/', user_Act.createUser);
router.post('/login', user_Act.loginUser);
router.patch('/:email', user_Act.updateUser);
router.delete('/:email', user_Act.deleteUser);

export default router;