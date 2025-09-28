import Joi from "joi";

// Validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details[0].message;
      return res.status(400).json({ 
        message: "Validation Error", 
        error: errorMessage 
      });
    }
    
    next();
  };
};

// Auth validation schemas
export const registerSchema = Joi.object({
  isUser: Joi.boolean().required(),
  isExpert: Joi.boolean().required(),
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  skills: Joi.array().items(Joi.string()).default([])
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Support request validation schemas
export const createSupportRequestSchema = Joi.object({
  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().min(10).max(2000).required(),
  budget: Joi.number().positive().max(100000).required(),
  deadline: Joi.date().greater('now').required(),
  skills: Joi.array().items(Joi.string()).default([])
});

export const updateSupportRequestSchema = Joi.object({
  title: Joi.string().min(5).max(100),
  description: Joi.string().min(10).max(2000),
  budget: Joi.number().positive().max(100000),
  deadline: Joi.date().greater('now'),
  skills: Joi.array().items(Joi.string())
}).min(1); // En az bir alan güncellenmeli

// Offer validation schemas
export const createOfferSchema = Joi.object({
  supportRequestId: Joi.string().hex().length(24).required(),
  message: Joi.string().min(10).max(1000).required(),
  proposedPrice: Joi.number().positive().max(100000).required(),
  estimatedDuration: Joi.string().min(1).max(100).required()
});

// Params validation
export const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!Joi.string().hex().length(24).validate(id).error) {
      next();
    } else {
      return res.status(400).json({ 
        message: `Invalid ${paramName} format` 
      });
    }
  };
};
