export const JWT = {
    SECRET: process.env.JWT_SECRET || 'sdfdsfds',
    ISSUER: process.env.JWT_ISSUER || 'Ahmed',
    ACCESS_EXPIRES_IN: Number(process.env.JWT_EXPIRES_IN_SECONDS) || 8 * 3600,
    REFRESH_EXPIRES_IN: Number(process.env.JWT_REFRESH_EXPIRES_IN_SECONDS) || 7 * 24 * 3600,
};

export const CLOUDINARY = {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    API_KEY: process.env.CLOUDINARY_API_KEY,
    API_SECRET: process.env.CLOUDINARY_API_SECRET,
    URL: process.env.CLOUDINARY_URL,
};