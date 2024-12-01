import { unconjugate } from '../conjugations';

describe('Conjugate', () => {
    it('should unconjugate', () => {
        const result = unconjugate('食べた');
        expect(result).toEqual([
            {
                "found": "past tense",
                "verbType": "v1",
                "word": "食べる",
            },
            {
                "found": "short potential",
                "verbType": "v5b",
                "word": "食ぶ",
            },
        ]);
    })
})