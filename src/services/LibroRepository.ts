
import { supabase } from '../Lib/supabase';
import { Libro } from '../models/Libro';

export class LibroRepository {
  async obtenerLibros(): Promise<Libro[]> {
    const { data, error } = await supabase
      .from('libros')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      throw new Error('Error al obtener libros: ' + error.message);
    }

    return (data ?? []).map(
      (libro) =>
        new Libro(
          libro.id,
          libro.titulo,
          libro.autor,
          libro.anio
        )
    );
  }

async agregarLibro(libro: Libro): Promise<void> {
  const { error } = await supabase.from('libros').insert({
    titulo: libro.obtenerTitulo(),
    autor: libro.obtenerAutor(),
    anio: libro.obtenerAnio(),
  });

  if (error) {
    throw new Error('Error al agregar libro: ' + error.message);
  }
}
  async eliminarLibro(id: number): Promise<void> {
    const { error } = await supabase
      .from('libros')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error('Error al eliminar libro: ' + error.message);
    }
  }
}