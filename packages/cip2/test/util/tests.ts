import { CardanoSerializationLib, CSL, loadCardanoSerializationLib } from '@cardano-sdk/core';
import { createCslTestUtils, TestUtils } from './util';
import { InputSelector } from '../../src/types';
import { InputSelectionError, InputSelectionFailure } from '../../src/InputSelectionError';
import { MockSelectionConstraints, toConstraints } from './constraints';
import { assertInputSelectionProperties } from './properties';

export interface InputSelectionPropertiesTestParams {
  /**
   * Test subject (Input Selection algorithm under test)
   */
  getAlgorithm: (SerializationLib: CardanoSerializationLib) => InputSelector;
  /**
   * Available UTxO
   */
  createUtxo: (utils: TestUtils) => CSL.TransactionUnspentOutput[];
  /**
   * Transaction outputs
   */
  createOutputs: (utils: TestUtils) => CSL.TransactionOutput[];
  /**
   * Input selection constraints passed to the algorithm.
   */
  mockConstraints: MockSelectionConstraints;
}

export interface InputSelectionFailureModeTestParams extends InputSelectionPropertiesTestParams {
  /**
   * Error that should be thrown
   */
  expectedError: InputSelectionFailure;
}

/**
 * Run input selection and assert that implementation throws error of specific failure.
 */
export const testInputSelectionFailureMode = async ({
  getAlgorithm,
  createUtxo,
  createOutputs,
  expectedError,
  mockConstraints
}: InputSelectionFailureModeTestParams) => {
  const SerializationLib = await loadCardanoSerializationLib();
  const utils = createCslTestUtils(SerializationLib);
  const utxo = createUtxo(utils);
  const outputs = createOutputs(utils);
  const algorithm = getAlgorithm(SerializationLib);
  await expect(
    algorithm.select({ utxo, outputs: utils.createOutputsObj(outputs), constraints: toConstraints(mockConstraints) })
  ).rejects.toThrowError(new InputSelectionError(expectedError));
};

/**
 * Run input selection and assert properties
 */
export const testInputSelectionProperties = async ({
  getAlgorithm,
  createUtxo,
  createOutputs,
  mockConstraints
}: InputSelectionPropertiesTestParams) => {
  const SerializationLib = await loadCardanoSerializationLib();
  const utils = createCslTestUtils(SerializationLib);
  const utxo = createUtxo(utils);
  const outputs = createOutputs(utils);
  const outputsObj = utils.createOutputsObj(outputs);
  const algorithm = getAlgorithm(SerializationLib);
  const results = await algorithm.select({ utxo, outputs: outputsObj, constraints: toConstraints(mockConstraints) });
  assertInputSelectionProperties({ utils, results, outputs, outputsObj, constraints: mockConstraints, utxo });
};
