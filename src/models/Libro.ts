
export class Libro {
  private id: number;
  private titulo: string;
  private autor: string;
  private anio: number;
  
getId(): number {
  return this.id;
}

  constructor(
    id: number,
    titulo: string,
    autor: string,
    anio: number
  ) {
    this.id = id;
    this.titulo = titulo;
    this.autor = autor;
    this.anio = anio;
  }

  obtenerId(): number {
    return this.id;
  }

  obtenerTitulo(): string {
    return this.titulo;
  }

  obtenerAutor(): string {
    return this.autor;
  }

  obtenerAnio(): number {
    return this.anio;
  }
}