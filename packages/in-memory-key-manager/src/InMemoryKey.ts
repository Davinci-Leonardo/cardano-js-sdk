import * as bip39 from 'bip39';
import { Cardano, CardanoSerializationLib, CSL } from '@cardano-sdk/core';
import { KeyManagement } from '@cardano-sdk/wallet';
import { harden } from './util';

/**
 *
 */
export const createInMemoryKeyManager = ({
  csl,
  password,
  accountIndex,
  mnemonic,
  networkId
}: {
  csl: CardanoSerializationLib;
  password: string;
  accountIndex?: number;
  mnemonic: string;
  networkId: Cardano.NetworkId;
}): KeyManagement.KeyManager => {
  if (!accountIndex) {
    accountIndex = 0;
  }

  const validMnemonic = bip39.validateMnemonic(mnemonic);
  if (!validMnemonic) throw new KeyManagement.errors.InvalidMnemonic();

  const entropy = bip39.mnemonicToEntropy(mnemonic);
  const accountPrivateKey = csl.Bip32PrivateKey.from_bip39_entropy(Buffer.from(entropy, 'hex'), Buffer.from(password))
    .derive(harden(1852))
    .derive(harden(1815))
    .derive(harden(accountIndex));

  const privateParentKey = accountPrivateKey.derive(0).derive(0);
  const publicParentKey = privateParentKey.to_public();
  const publicKey = accountPrivateKey.to_public();
  const stakeKey = publicKey.derive(2).derive(0);

  return {
    deriveAddress: (addressIndex, index) => {
      const utxoPubKey = publicKey.derive(index).derive(addressIndex);
      const baseAddr = csl.BaseAddress.new(
        networkId,
        csl.StakeCredential.from_keyhash(utxoPubKey.to_raw_key().hash()),
        csl.StakeCredential.from_keyhash(stakeKey.to_raw_key().hash())
      );

      return baseAddr.to_address().to_bech32();
    },
    signMessage: async (_addressType, _signingIndex, message) => ({
      publicKey: publicParentKey.toString(),
      signature: `Signature for ${message} is not implemented yet`
    }),
    signTransaction: async (txHash: CSL.TransactionHash) => {
      const witnessSet = csl.TransactionWitnessSet.new();
      const vkeyWitnesses = csl.Vkeywitnesses.new();
      const vkeyWitness = csl.make_vkey_witness(txHash, privateParentKey.to_raw_key());
      vkeyWitnesses.add(vkeyWitness);
      witnessSet.set_vkeys(vkeyWitnesses);
      return witnessSet;
    },
    stakeKey: stakeKey.to_raw_key(),
    publicKey: publicKey.to_raw_key(),
    publicParentKey: publicParentKey.to_raw_key()
  };
};
