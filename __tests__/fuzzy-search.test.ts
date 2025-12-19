import Fuse from 'fuse.js';
import { PRODUCT_TAGS } from '@/data/products';

const mockProducts = [
    { id: '1', name: 'Tomahawk Premium', tags: PRODUCT_TAGS.tomahawk, category: 'Res' },
    { id: '2', name: 'Puyazo de Res', tags: PRODUCT_TAGS.puyazo, category: 'Res' },
    { id: '3', name: 'Chorizo Santandereano', tags: PRODUCT_TAGS.chorizo, category: 'Embutidos' },
];

/**
 * Fuzzy Search Consistency Test (MANDATO-FILTRO)
 * Valida que el algoritmo de búsqueda difusa entienda la intención y tolere errores.
 */
describe('Fuzzy Search Engine (Fuse.js + Tags)', () => {
    const fuse = new Fuse(mockProducts, {
        keys: ['name', 'tags', 'category'],
        threshold: 0.35,
    });

    test('Debe encontrar Tomahawk por su nombre', () => {
        const results = fuse.search('tomahawk');
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].item.name).toBe('Tomahawk Premium');
    });

    test('Debe encontrar productos por etiquetas semánticas (Intention Search)', () => {
        const results = fuse.search('asado');
        expect(results.length).toBeGreaterThan(0);
    });

    test('Debe encontrar por etiquetas de origen/tipo', () => {
        const results = fuse.search('picaña'); // Tag del Puyazo
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].item.name).toContain('Puyazo');
    });

    test('Debe devolver vacío si la búsqueda es totalmente irrelevante', () => {
        const results = fuse.search('computador portatil');
        expect(results.length).toBe(0);
    });
});
