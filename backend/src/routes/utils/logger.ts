const formatTime = (): string => {
   const now = new Date();
   const pad = (n: number) => n.toString().padStart(2, '0');
   return `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
 };
 
 const log = (level: 'INFO' | 'WARN' | 'ERROR' | 'LOG', context: string, message: any, ...args: any[]) => {
   const timestamp = formatTime();
   const prefix = `[${context}]:${timestamp}:`;
   
   switch (level) {
     case 'INFO':
     case 'LOG':
       console.log(`${prefix} ${message}`, ...args);
       break;
     case 'WARN':
       console.warn(`${prefix} ${message}`, ...args);
       break;
     case 'ERROR':
       console.error(`${prefix} ${message}`, ...args);
       break;
   }
 };
 
 export const createLogger = (context: string) => ({
   log: (message: string, ...args: any[]) => log('LOG', context, message, ...args),
   info: (message: string, ...args: any[]) => log('INFO', context, message, ...args),
   warn: (message: string, ...args: any[]) => log('WARN', context, message, ...args),
   error: (message: string, ...args: any[]) => log('ERROR', context, message, ...args),
 });
 