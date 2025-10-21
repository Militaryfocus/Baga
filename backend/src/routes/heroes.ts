import { Router } from 'express';
import { HeroController } from '../controllers/heroController';
import { validateQuery } from '../middleware/validation';
import { paginationSchema } from '../utils/validation';

const router = Router();
const heroController = new HeroController();

// Public routes
router.get('/', 
  validateQuery(paginationSchema),
  heroController.getHeroes
);

router.get('/search', 
  heroController.searchHeroes
);

router.get('/popular', 
  heroController.getPopularHeroes
);

router.get('/roles', 
  heroController.getHeroRoles
);

router.get('/difficulties', 
  heroController.getHeroDifficulties
);

router.get('/:id', 
  heroController.getHeroById
);

router.get('/slug/:slug', 
  heroController.getHeroBySlug
);

export default router;