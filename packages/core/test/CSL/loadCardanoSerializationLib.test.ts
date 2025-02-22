import { loadCardanoSerializationLib } from '../../src/CSL/loadCardanoSerializationLib';

describe('loadLibrary', () => {
  it('loads the appropriate library in Node.js', async () => {
    const cardanoSerializationLib = await loadCardanoSerializationLib();
    expect(cardanoSerializationLib.TransactionInput).toBeDefined();
  });
});
