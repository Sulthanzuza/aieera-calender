import express from 'express';
import {
  createContent,
  getContent,
  updateContent,
  deleteContent,
  getEventsByDate
} from '../controllers/contentController';

const router = express.Router();

router.post('/', createContent);


router.get('/', getContent);

router.put('/:id', updateContent);
router.get('/by-date', getEventsByDate);

router.delete('/:id', deleteContent);

export default router;