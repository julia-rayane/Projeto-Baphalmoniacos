export interface ICategoria {
  id?: number;
  nome: string;
}

export interface IProduto {
  id?: number;
  nome: string;
  descricao: string;
  preco: number;
  foto: string;
  id_categoria_fk: number;
}

// Tipo extra para quando o Model juntar o Produto com a Categoria via JOIN
export interface IProdutoComCategoria extends IProduto {
  categoria_nome?: string;
}
