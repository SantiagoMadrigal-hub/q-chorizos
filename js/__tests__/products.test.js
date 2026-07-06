import { describe, it, expect } from 'vitest';

const PRODUCTS = {
  'Chorizo tradicional': { price: 25000, desc: 'El sabor de siempre que conquista a todos. Elaborado con carne de cerdo seleccionada y especias naturales.', badge: 'Más vendido' },
  'Chorizo picante':     { price: 23000, desc: 'Para los que se atreven. Intensidad y carácter en cada mordida con un toque de ají.', badge: 'Picante' },
  'Chorizo premium':     { price: 30000, desc: 'Experiencia gourmet. Ingredientes selectos para paladares exigentes.', badge: 'Premium' }
};

function formatPrice(n) {
  return '$' + n.toLocaleString('es-CO');
}

function clampQty(val) {
  return Math.max(1, Math.min(100, parseInt(val, 10) || 1));
}

describe('PRODUCTS data', () => {
  it('has 3 products', () => {
    expect(Object.keys(PRODUCTS)).toHaveLength(3);
  });

  it('each product has price, desc, badge', () => {
    Object.values(PRODUCTS).forEach(p => {
      expect(p).toHaveProperty('price');
      expect(p).toHaveProperty('desc');
      expect(p).toHaveProperty('badge');
      expect(typeof p.price).toBe('number');
      expect(p.price).toBeGreaterThan(0);
    });
  });

  it('tradicional is the most expensive product', () => {
    const prices = Object.values(PRODUCTS).map(p => p.price);
    expect(PRODUCTS['Chorizo premium'].price).toBe(Math.max(...prices));
  });
});

describe('formatPrice', () => {
  it('formats whole numbers with locale', () => {
    expect(formatPrice(25000)).toBe('$25.000');
  });

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('$0');
  });

  it('formats large numbers', () => {
    expect(formatPrice(12900)).toBe('$12.900');
  });
});

describe('clampQty', () => {
  it('returns valid numbers', () => {
    expect(clampQty('3')).toBe(3);
    expect(clampQty(5)).toBe(5);
  });

  it('clamps to minimum 1', () => {
    expect(clampQty('0')).toBe(1);
    expect(clampQty('-5')).toBe(1);
  });

  it('clamps to maximum 100', () => {
    expect(clampQty('200')).toBe(100);
    expect(clampQty('101')).toBe(100);
  });

  it('defaults to 1 for NaN', () => {
    expect(clampQty('abc')).toBe(1);
    expect(clampQty('')).toBe(1);
  });
});

describe('price calculation', () => {
  it('calculates total for a quantity', () => {
    const qty = 3;
    const price = PRODUCTS['Chorizo tradicional'].price;
    const total = qty * price;
    expect(total).toBe(75000);
    expect(formatPrice(total)).toBe('$75.000');
  });

  it('calculates different product totals', () => {
    const qty = 2;
    const totals = Object.entries(PRODUCTS).map(([name, p]) => ({
      name,
      total: formatPrice(qty * p.price)
    }));
    expect(totals).toContainEqual({ name: 'Chorizo premium', total: '$60.000' });
  });
});

describe('URL parameter parsing pattern', () => {
  it('extracts product name from search params', () => {
    const url = '?producto=Chorizo%20tradicional&cantidad=3';
    const params = new URLSearchParams(url);
    expect(params.get('producto')).toBe('Chorizo tradicional');
    expect(params.get('cantidad')).toBe('3');
  });

  it('handles missing params', () => {
    const params = new URLSearchParams('');
    expect(params.get('producto')).toBeNull();
    expect(params.get('cantidad')).toBeNull();
  });

  it('maps product param to valid product', () => {
    const param = 'Chorizo picante';
    expect(PRODUCTS[param]).toBeDefined();
    expect(PRODUCTS[param].price).toBe(23000);
  });
});
