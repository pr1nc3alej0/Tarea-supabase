
import { Libro } from '../models/Libro';
import { LibroRepository } from './LibroRepository';

export class LibroService {
  private repositorio: LibroRepository;

  constructor() {
    this.repositorio = new LibroRepository();
  }

  async agregarLibro(libro: Libro): Promise<void> {
    await this.repositorio.agregarLibro(libro);
  }

  async eliminarLibro(id: number): Promise<void> {
    await this.repositorio.eliminarLibro(id);
  }

  async obtenerLibros(): Promise<Libro[]> {
    return await this.repositorio.obtenerLibros();
  }
}