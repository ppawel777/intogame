const AUTH_ERROR_MESSAGES: Record<string, string> = {
   'User already registered': 'Пользователь уже зарегистрирован',
   'Email not confirmed': 'Email не подтверждён',
   'Invalid login credentials': 'Неверный email или пароль',
   'Invalid email or password': 'Неверный email или пароль',
   'Email rate limit exceeded': 'Слишком много попыток. Попробуйте позже',
   'Password should be at least 6 characters': 'Пароль должен быть не менее 6 символов',
   'Unable to validate email address': 'Не удалось проверить email-адрес',
}

export const localizeSupabaseError = (message: string): string => AUTH_ERROR_MESSAGES[message] || message
