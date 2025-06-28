import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const apiKeyAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const apiKey = process.env.API_KEY;
  
  // Verificar se a API_KEY está configurada
  if (!apiKey) {
    logger.error('API_KEY not configured in environment variables');
    res.status(500).json({ 
      error: 'API key not configured',
      message: 'Server configuration error'
    });
    return;
  }
  
  // Verificar se o header Authorization está presente
  if (!authHeader) {
    logger.warn('Request without Authorization header', { 
      ip: req.ip, 
      path: req.path 
    });
    res.status(401).json({ 
      error: 'Authorization header required',
      message: 'Please provide a valid API key in the Authorization header'
    });
    return;
  }
  
  // Extrair o token do header (suporta tanto "Bearer token" quanto "token")
  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : authHeader;
  
  // Verificar se o token é válido
  if (token !== apiKey) {
    logger.warn('Invalid API key attempt', { 
      ip: req.ip, 
      path: req.path,
      providedToken: token.substring(0, 8) + '...' // Log apenas os primeiros 8 caracteres por segurança
    });
    res.status(401).json({ 
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
    return;
  }
  
  // Se chegou até aqui, a autenticação foi bem-sucedida
  logger.info('API key authentication successful', { 
    ip: req.ip, 
    path: req.path 
  });
  
  next();
};
