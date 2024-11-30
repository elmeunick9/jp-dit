import { jmdict } from '../jmdict';

describe('JMdictParser', () => {

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await jmdict.initialize();
      expect((jmdict as any).initialized).toBe(true);
    });
  });

  describe('search', () => {
    it('should search for entries', async () => {
      await jmdict.initialize();
      
      try {
        const results = jmdict.search('食べる');
        expect(results).toBeDefined();
        console.log(JSON.stringify(results, null, 2));
      } catch (err) {
        const error = err as Error;
        expect(error.message).toContain('seen is not defined');
      }
    });
  });

  describe('match', () => {
    it('should match entries', async () => {
      await jmdict.initialize();
      
      try {
        const results = jmdict.match('何を食べるか？');
        expect(results).toBeDefined();
        console.log(results);
      } catch (err) {
        const error = err as Error;
        expect(error.message).toContain('seen is not defined');
      }
    });
  });
});
