const path = require("path");

/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: {
    // Resolve the Tailwind config by absolute path so it loads regardless of the
    // process working directory (e.g. when Next is launched from a parent folder).
    tailwindcss: { config: path.join(__dirname, "tailwind.config.ts") },
    autoprefixer: {},
  },
};
