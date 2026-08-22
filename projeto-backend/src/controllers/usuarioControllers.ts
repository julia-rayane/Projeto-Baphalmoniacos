import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secreta_super_segura';

// Cadastro 
export async function cadastrar(req: Request, res: Response) {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Preencha todos os campos.' });
    }

    const usuarioExiste = await prisma.usuario.findUnique({ where: { email } });
    if (usuarioExiste) {
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await prisma.usuario.create({
      data: { nome, email, senha: senhaHash },
    });

    return res.status(201).json({
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno ao cadastrar.' });
  }
}

// Login 
export async function login(req: Request, res: Response) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Informe e-mail e senha.' });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno ao autenticar.' });
  }
}
