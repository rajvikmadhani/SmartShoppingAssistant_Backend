import { body, param, validationResult } from 'express-validator';

// Validation middleware for recording battle results
export const validateBattleResult = [
  body('userId').isInt().withMessage('User ID must be an integer'),
  body('playerPokemonId').isInt().withMessage('Player Pokemon ID must be an integer'),
  body('wildPokemonId').isInt().withMessage('Wild Pokemon ID must be an integer'),
  body('result').isIn(['win', 'loss']).withMessage('Result must be either win or loss'),
  body('playerPokemonLevel').isInt({ min: 1 }).withMessage('Player Pokemon level must be a positive integer'),
  
  // Middleware to check for validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validation middleware for fetching Pokemon data
export const validatePokemonId = [
  param('id').isInt().withMessage('Pokemon ID must be an integer'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validation middleware for updating Pokemon stats
export const validatePokemonStats = [
  param('id').isInt().withMessage('Pokemon ID must be an integer'),
  body('level').optional().isInt({ min: 1 }).withMessage('Level must be a positive integer'),
  body('maxHp').optional().isInt({ min: 1 }).withMessage('Max HP must be a positive integer'),
  body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a non-negative integer'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
]; 