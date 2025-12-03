import express from 'express';
import { createLogger } from './utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const logger = createLogger('admin');

// Проверка наличия SERVICE_ROLE_KEY
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  logger.error('SUPABASE_SERVICE_ROLE_KEY не найден в переменных окружения');
}

// Удаляет всех пользователей, email которых содержит указанный паттерн
// curl -s -X POST http://localhost:3000/api/admin/cleanup-test-users -H "Content-Type: application/json" -d '{"emailPattern": "ppawel1@"}' | python3 -m json.tool
router.post('/cleanup-test-users', async (req, res) => {
  try {
    if (!SERVICE_ROLE_KEY) {
      logger.error('SUPABASE_SERVICE_ROLE_KEY не настроен');
      return res.status(500).json({ 
        error: 'Сервисный ключ не настроен', 
        details: 'Проверьте переменную окружения SUPABASE_SERVICE_ROLE_KEY' 
      });
    }

    const { emailPattern = 'ppawel1@' } = req.body || {};

    // Получаем всех пользователей через Admin API
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      logger.error('Ошибка получения списка пользователей:', errorData);
      return res.status(500).json({ error: 'Не удалось получить список пользователей', details: errorData.message || errorData.msg || 'HTTP ' + response.status });
    }

    const users = await response.json();

    if (!users || !users.users) {
      return res.status(200).json({ message: 'Пользователи не найдены', deleted: 0 });
    }

    // Фильтруем тестовых пользователей по паттерну email
    const testUsers = users.users.filter((user: any) => {
      const email = user.email?.toLowerCase() || '';
      return email.includes(emailPattern.toLowerCase());
    });

    if (testUsers.length === 0) {
      return res.status(200).json({ 
        message: 'Тестовые пользователи не найдены', 
        deleted: 0,
        pattern: emailPattern 
      });
    }

    // Удаляем каждого пользователя
    const deleteResults = await Promise.allSettled(
      testUsers.map(async (user: any) => {
        const deleteResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${user.id}`, {
          method: 'DELETE',
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
          },
        });
        
        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json().catch(() => ({ message: 'Unknown error' }));
          throw new Error(errorData.message || errorData.msg || 'HTTP ' + deleteResponse.status);
        }
        
        return await deleteResponse.json();
      })
    );

    const successful = deleteResults.filter((r) => r.status === 'fulfilled').length;
    const failed = deleteResults.filter((r) => r.status === 'rejected').length;

    const errors = deleteResults
      .filter((r) => r.status === 'rejected')
      .map((r) => (r as PromiseRejectedResult).reason?.message || 'Unknown error');

    logger.log(`Removed users: ${successful}, errors: ${failed}`);

    return res.status(200).json({
      message: 'Clear success',
      deleted: successful,
      failed,
      total: testUsers.length,
      pattern: emailPattern,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error: any) {
    logger.error('Error with clear users:', error);
    return res.status(500).json({ 
      error: 'Internal error', 
      details: error.message 
    });
  }
});

// GET /api/admin/list-users
// Список всех пользователей (для проверки)
router.get('/list-users', async (req, res) => {
  try {
    if (!SERVICE_ROLE_KEY) {
      logger.error('SUPABASE_SERVICE_ROLE_KEY не настроен');
      return res.status(500).json({ 
        error: 'Сервисный ключ не настроен', 
        details: 'Проверьте переменную окружения SUPABASE_SERVICE_ROLE_KEY' 
      });
    }

    const { emailPattern } = req.query || {};

    // Получаем всех пользователей через Admin API (прямой HTTP запрос)
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      logger.error('Ошибка получения списка пользователей:', errorData);
      return res.status(500).json({ error: 'Не удалось получить список пользователей', details: errorData.message || errorData.msg || 'HTTP ' + response.status });
    }

    const users = await response.json();

    if (!users || !users.users) {
      return res.status(200).json({ users: [], total: 0 });
    }

    let filteredUsers = users.users;

    // Фильтрация по паттерну, если указан
    if (emailPattern && typeof emailPattern === 'string') {
      const pattern = emailPattern.toLowerCase();
      filteredUsers = users.users.filter((user: any) => {
        const email = user.email?.toLowerCase() || '';
        return email.includes(pattern);
      });
    }

    const userList = filteredUsers.map((user: any) => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
    }));

    return res.status(200).json({
      users: userList,
      total: userList.length,
      pattern: emailPattern || 'all',
    });

  } catch (error: any) {
    logger.error('Ошибка при получении списка пользователей:', error);
    return res.status(500).json({ 
      error: 'Внутренняя ошибка сервера', 
      details: error.message 
    });
  }
});

export default router;

