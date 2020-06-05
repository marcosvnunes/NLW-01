import express from 'express';
import PointsController from './controllers/pointsController';
import ItensController from './controllers/itemsController';
import {celebrate , Joi} from 'celebrate';
import multer from 'multer';

import multerConfig from './config/multer';
const pointsController = new PointsController();
const itensController = new ItensController();

const upload = multer(multerConfig);
const routes = express.Router();

routes.get('/items', itensController.index);

routes.get('/points', pointsController.index);
routes.get('/points/:id', pointsController.show);

routes.post('/points',
  upload.single('image'),
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().required().email(),
      whatsapp: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      city: Joi.string().required(),
      uf: Joi.string().required().max(2),
      items: Joi.string().required(),
    })
  }),
  pointsController.create);



export default routes;
