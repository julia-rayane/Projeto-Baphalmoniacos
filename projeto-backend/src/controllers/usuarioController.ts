import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import SendMail from '../services/SendMail.js'; // Adicionado .js para corrigir a compilação ESM/NodeNext (npm run build)

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secreta_super_segura';

// Cadastro de Usuário
export async function cadastrar(req: Request, res: Response) {
  try {
    const { nome, email, senha } = req.body;

    // Verifica se o e-mail já está cadastrado
    const usuarioExiste = await prisma.usuario.findUnique({ where: { email } });
    if (usuarioExiste) {
      // Ajustado de 400 para 409 Conflict conforme exigido na rubrica
      return res.status(409).json({ error: 'E-mail já cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await prisma.usuario.create({
      data: { nome, email, senha: senhaHash, role: 'cliente' },
    });

    // Envio do e-mail de boas-vindas com tratamento seguro para não derrubar a resposta 201
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
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno ao autenticar.' });
  }
}
