import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../database/database.js';
import SendMail from '../services/SendMail.js';
import ImageModel from '../models/imageModel.js';
import { JWT_SECRET } from '../config/auth.js';

// Cadastro de Usuário
export async function cadastrar(req: Request, res: Response) {
  try {
    const { nome, email, senha } = req.body;

    const usuarioExiste = await prisma.usuario.findUnique({ where: { email } });
    if (usuarioExiste) {
      return res.status(409).json({ error: 'E-mail já cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await prisma.usuario.create({
      data: { nome, email, senha: senhaHash, role: 'cliente' },
    });

    try {
      await SendMail.createNewUser(novoUsuario.email);
    } catch (mailError) {
      console.error('Falha ao enviar e-mail de boas-vindas:', mailError);
    }

    return res.status(201).json({
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      role: novoUsuario.role,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno ao cadastrar.' });
  }
}

// Login de Usuário
export async function login(req: Request, res: Response) {
  try {
    const { email, senha } = req.body;

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { image: true },
    });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        avatar: usuario.image?.path ?? null,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno ao autenticar.' });
  }
}

// Dados do usuário logado (inclui o caminho da imagem, se houver)
export async function me(req: Request, res: Response) {
  try {
    const usuarioId = (req as any).usuarioId as number;

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        image: { select: { path: true } },
      },
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.json(usuario);
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno ao buscar o usuário.' });
  }
}

// Upload / atualização do avatar (usado por POST e PUT /users/image)
// Neste ponto o Multer já validou tamanho + tipo e gravou o arquivo em disco.
export async function uploadAvatar(req: Request, res: Response) {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado. Use o campo "image".' });
  }

  const usuarioId = (req as any).usuarioId as number;
  const novoCaminho = `/imgs/profile/${file.filename}`;

  try {
    const anterior = await ImageModel.findByUser(usuarioId);
    const image = await ImageModel.upsert({ usuarioId, caminho: novoCaminho });

    // Troca de foto: apaga o arquivo antigo do disco para não acumular lixo
    if (anterior) {
      await ImageModel.removeFile(anterior.path);
    }

    // POST = primeiro envio (201). PUT = atualização (200).
    const status = req.method === 'POST' ? 201 : 200;
    return res.status(status).json({ id: image.id, path: image.path });
  } catch (error) {
    // Falhou no banco: não deixa o arquivo órfão no disco
    await ImageModel.removeFile(novoCaminho);
    return res.status(400).json({ error: 'Não foi possível salvar a imagem do usuário.' });
  }
}
