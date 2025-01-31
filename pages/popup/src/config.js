const isDev = import.meta.env.MODE === 'development';
const isProd = import.meta.env.MODE === 'production';

export { isDev, isProd };
