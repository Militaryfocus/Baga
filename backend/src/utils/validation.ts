import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  username: Joi.string().min(3).max(20).alphanum().required().messages({
    'string.min': 'Username must be at least 3 characters long',
    'string.max': 'Username must be at most 20 characters long',
    'string.alphanum': 'Username must contain only alphanumeric characters',
    'any.required': 'Username is required'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required'
  })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

export const createPostSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.min': 'Title is required',
    'string.max': 'Title must be at most 200 characters long',
    'any.required': 'Title is required'
  }),
  content: Joi.string().min(1).max(10000).required().messages({
    'string.min': 'Content is required',
    'string.max': 'Content must be at most 10000 characters long',
    'any.required': 'Content is required'
  }),
  category: Joi.string().valid('GUIDES', 'NEWS', 'FANART', 'GAMEPLAY', 'DISCUSSION', 'MEMES').required().messages({
    'any.only': 'Category must be one of: GUIDES, NEWS, FANART, GAMEPLAY, DISCUSSION, MEMES',
    'any.required': 'Category is required'
  }),
  heroId: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

export const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required().messages({
    'string.min': 'Comment content is required',
    'string.max': 'Comment must be at most 1000 characters long',
    'any.required': 'Comment content is required'
  }),
  postId: Joi.string().required().messages({
    'any.required': 'Post ID is required'
  }),
  parentId: Joi.string().optional()
});

export const createHeroBuildSchema = Joi.object({
  heroId: Joi.string().required().messages({
    'any.required': 'Hero ID is required'
  }),
  title: Joi.string().min(1).max(100).required().messages({
    'string.min': 'Title is required',
    'string.max': 'Title must be at most 100 characters long',
    'any.required': 'Title is required'
  }),
  description: Joi.string().min(1).max(1000).required().messages({
    'string.min': 'Description is required',
    'string.max': 'Description must be at most 1000 characters long',
    'any.required': 'Description is required'
  }),
  type: Joi.string().valid('DAMAGE', 'TANK', 'SUPPORT', 'HYBRID').required().messages({
    'any.only': 'Type must be one of: DAMAGE, TANK, SUPPORT, HYBRID',
    'any.required': 'Type is required'
  }),
  items: Joi.array().items(Joi.string()).min(1).max(6).required().messages({
    'array.min': 'At least 1 item is required',
    'array.max': 'Maximum 6 items allowed',
    'any.required': 'Items are required'
  }),
  emblem: Joi.string().optional()
});

export const reportSchema = Joi.object({
  postId: Joi.string().optional(),
  commentId: Joi.string().optional(),
  reason: Joi.string().min(1).max(200).required().messages({
    'string.min': 'Reason is required',
    'string.max': 'Reason must be at most 200 characters long',
    'any.required': 'Reason is required'
  }),
  description: Joi.string().max(500).optional().messages({
    'string.max': 'Description must be at most 500 characters long'
  })
}).or('postId', 'commentId');

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

export const validate = (schema: Joi.ObjectSchema, data: any) => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    const errors = error.details.map(detail => detail.message);
    throw new Error(errors.join(', '));
  }
  return value;
};