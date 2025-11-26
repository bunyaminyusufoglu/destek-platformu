import Joi from "joi";

// Validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      // İlk hatayı al
      const firstError = error.details[0];
      // Şemada tanımlı custom mesaj varsa onu kullan, yoksa varsayılan mesajı Türkçe'ye çevir
      let errorMessage = firstError.message;
      
      // Eğer mesaj hala İngilizce Joi mesajıysa Türkçe'ye çevir
      if (errorMessage.includes('must be a valid email')) {
        errorMessage = 'Lütfen geçerli bir email adresi giriniz';
      } else if (errorMessage.includes('is required')) {
        const field = firstError.path[0];
        if (field === 'email') {
          errorMessage = 'Email adresi gereklidir';
        } else if (field === 'password') {
          errorMessage = 'Şifre gereklidir';
        } else {
          errorMessage = `${field} alanı gereklidir`;
        }
      } else if (errorMessage.includes('length must be at least')) {
        const field = firstError.path[0];
        if (field === 'password') {
          errorMessage = 'Şifre en az 6 karakter olmalıdır';
        } else {
          errorMessage = `${field} alanı çok kısa`;
        }
      } else if (errorMessage.includes('length must be less than')) {
        errorMessage = 'Girilen değer çok uzun';
      }
      
      return res.status(400).json({ 
        message: errorMessage
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

// Profile update validation schemas
export const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  skills: Joi.array().items(Joi.string()).optional()
}).min(1); // En az bir alan güncellenmeli

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(100).required()
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Lütfen geçerli bir email adresi giriniz',
      'any.required': 'Email adresi gereklidir',
      'string.empty': 'Email adresi boş olamaz'
    })
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
