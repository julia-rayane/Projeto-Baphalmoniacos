import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// Recria __dirname em ambiente ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pasta (dentro de public/) onde as imagens ficam gravadas em disco
export const uploadFolder = path.resolve(__dirname, '..', '..', 'public', 'imgs', 'profile');

// Garante que a pasta exista mesmo num clone novo (o conteúdo dela não vai pro Git)
fs.mkdirSync(uploadFolder, { recursive: true });

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

// Lista permitida de tipos MIME -> extensão que NÓS escolhemos (nunca a do cliente)
const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
};

const multerConfig: multer.Options = {
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadFolder),
    filename: (_req, file, cb) => {
      // Nome 100% gerado pelo servidor: hash aleatório + extensão derivada do MIME.
      // O nome enviado pelo cliente é ignorado (evita sobrescrita e caminhos maliciosos).
      const hash = crypto.randomBytes(16).toString('hex');
      cb(null, `${hash}${EXTENSIONS[file.mimetype]}`);
    },
  }),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype in EXTENSIONS) {
      cb(null, true);
    } else {
      // Rejeitado ANTES de gravar: nada vai para o disco
      cb(new Error('INVALID_FILE_TYPE'));
    }
  },
};

export default multerConfig;
