export default ({ config }) => ({
  ...config,
  extra: {
    API_BASE_URL:
      process.env.APP_ENV === "production"
        ? "https://agrimind-x.onrender.com"
        : process.env.LOCAL_API_URL || "http://192.168.1.4:8000",
  },
});
