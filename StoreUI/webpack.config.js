import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  // Other configurations...
  // cache: false,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Adjust the path to your project structure
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss'], // Add other extensions as needed
  },
};
