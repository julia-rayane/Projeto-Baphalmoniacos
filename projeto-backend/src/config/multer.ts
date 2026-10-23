import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// Recria a variável __dirname em ambiente ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pasta onde as imagens serão salvas em disco
const uploadFolder = path.resolve(__dirname, '..', '..', 'public', 'imgs', 'profile');

export default {
  directory: uploadFolder,
  storage: multer.diskStorage({
    destination: uploadFolder,
    filename: (req, file, cb) => {
      // Gera hash único mantendo apenas a extensão original (evita nomes maliciosos)
      const fileHash = crypto.randomBytes(16).toString('hex');
      const extension = path.extname(file.originalname);
      const fileName = `${fileHash}${extension}`;

      return cb(null, fileName);
    },
  }),
  limits: {
    fileSize: 2 * 1024 * 1024, // Limite de 2MB
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('INVALID_FILE_TYPE'));
    }
  },
};
