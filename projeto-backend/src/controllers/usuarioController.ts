import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import SendMail from '../services/SendMail.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secreta_super_segura';

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

    const usuario = await prisma.usuario.findUnique({ where: { email } });
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
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role, avatar: usuario.avatar },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno ao autenticar.' });
  }
}

// Upload de Avatar do Usuário
export async function uploadAvatar(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const usuarioId = (req as any).usuarioId;
    const publicPath = `/imgs/profile/${req.file.filename}`;

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { avatar: publicPath },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        avatar: true,
      },
    });

    return res.status(201).json(usuarioAtualizado);
  } catch (error) {
    return res.status(400).json({ error: 'Erro ao atualizar o avatar do usuário.' });
  }
}
