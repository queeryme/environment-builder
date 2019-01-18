export const environment = {
  baseUrl: {
    server: process.env.BASE_URL_SERVER || '',
    client: process.env.BASE_URL_CLIENT || '',
  },
  production: !!process.env.PRODUCTION || false,
  title: process.env.TITLE || '',
  imageWidth: parseInt(process.env.IMAGE_WIDTH, 10) || 0,
  imageHeight: parseInt(process.env.IMAGE_HEIGHT, 10) || 0,
  appId: process.env.APP_ID || '',
};
