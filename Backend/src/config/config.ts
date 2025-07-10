export const JWT = {
    SECRET: process.env.JWT_SECRET || 'sdfdsfds',
    ISSUER: process.env.JWT_ISSUER || 'Ahmed',
    ACCESS_EXPIRES_IN: Number(process.env.JWT_EXPIRES_IN_SECONDS) || 7 * 24 * 3600,
    REFRESH_EXPIRES_IN: Number(process.env.JWT_REFRESH_EXPIRES_IN_SECONDS) || 7 * 24 * 3600,
};