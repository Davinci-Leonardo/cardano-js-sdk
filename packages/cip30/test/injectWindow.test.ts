import { mocks } from 'mock-browser';
import { Wallet } from '@src/Wallet';
import { api, properties, requestAccess } from './testWallet';
import { injectWindow, WindowMaybeWithCardano } from '@src/injectWindow';

describe('injectWindow', () => {
  let wallet: Wallet;
  let window: ReturnType<typeof mocks.MockBrowser>;

  beforeEach(() => {
    wallet = new Wallet(properties, api, requestAccess, { persistAllowList: false });
    window = mocks.MockBrowser.createWindow();
  });

  it('creates the cardano scope when not exists, and injects the wallet public API into it', async () => {
    expect(window.cardano).not.toBeDefined();
    injectWindow(window, wallet);
    expect(window.cardano).toBeDefined();
    expect(window.cardano[properties.name].name).toBe(properties.name);
    expect(await window.cardano[properties.name].isEnabled()).toBe(false);
    await window.cardano[properties.name].enable();
    expect(await window.cardano[properties.name].isEnabled()).toBe(true);
  });

  describe('existing cardano object', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let anotherObj: any;

    beforeEach(() => {
      anotherObj = { could: 'be', anything: 'here' };
      expect(window.cardano).not.toBeDefined();
      window.cardano = {} as WindowMaybeWithCardano;
      window.cardano['another-obj'] = anotherObj;
      expect(window.cardano).toBeDefined();
    });

    it('injects the wallet public API into the existing cardano scope', () => {
      expect(window.cardano).toBeDefined();
      injectWindow(window, wallet);
      expect(window.cardano[properties.name].name).toBe(properties.name);
      expect(Object.keys(window.cardano[properties.name])).toEqual(['name', 'version', 'enable', 'isEnabled']);
      expect(window.cardano['another-obj']).toBe(anotherObj);
    });
  });
});
