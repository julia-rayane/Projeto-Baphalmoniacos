import * as ProductModel from '../models/productModel.js';

// 1. LISTAR TODOS (GET /produtos) 
export async function listProducts(req, res) {
  try {
    const products = await ProductModel.getAllProducts();
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar produtos.' });
  }
}

// 2. BUSCAR POR ID (GET /produtos/:id)
export async function showProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await ProductModel.getProductById(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }
    
    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar produto.' });
  }
}

// 3. CRIAR NOVO (POST /produtos) - Com as validações exigidas no material
export async function addProduct(req, res) {
  try {
    const { nome, descricao, preco, foto, id_categoria_fk } = req.body;

    // Validação para garantir os 25 pontos do critério de erros do professor
    if (!nome || !descricao || !preco || !id_categoria_fk) {
      return res.status(400).json({ error: 'Os campos nome, descricao, preco e id_categoria_fk são obrigatórios.' });
    }

    const newProductId = await ProductModel.createProduct(req.body);
    return res.status(201).json({ id_produto: newProductId, message: 'Produto criado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar produto.' });
  }
}

// 4. ATUALIZAR (PUT /produtos/:id)
export async function editProduct(req, res) {
  try {
    const { id } = req.params;
    const { nome, descricao, preco, id_categoria_fk } = req.body;

    const productExists = await ProductModel.getProductById(id);
    if (!productExists) {
      return res.status(404).json({ error: 'Produto não encontrado para atualização.' });
    }

    if (!nome || !descricao || !preco || !id_categoria_fk) {
      return res.status(400).json({ error: 'Campos obrigatórios em falta.' });
    }

    await ProductModel.updateProduct(id, req.body);
    return res.status(200).json({ message: 'Produto atualizado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar produto.' });
  }
}

// 5. REMOVER (DELETE /produtos/:id)
export async function removeProduct(req, res) {
  try {
    const { id } = req.params;
    
    const productExists = await ProductModel.getProductById(id);
    if (!productExists) {
      return res.status(404).json({ error: 'Produto não encontrado para remoção.' });
    }

    await ProductModel.deleteProduct(id);
    return res.status(200).json({ message: 'Produto removido com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao remover produto.' });
  }
}
