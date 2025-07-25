import * as borsh from "borsh";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { test, expect, beforeEach } from "bun:test";
import { COUNTER_SIZE, schema } from "./types";

let adminAccount = Keypair.generate();
let counterAccount = Keypair.generate();
let connection = new Connection("http://127.0.0.1:8899");
let programId = new PublicKey("9XPtGTE94RZeWaBnAurCdUf5CgPDLUEo3o7gKsx4mhP5");

beforeEach(async () => {
  const airdropSig = await connection.requestAirdrop(
    adminAccount.publicKey,
    1 * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(airdropSig);
  console.log("balance: ", await connection.getBalance(adminAccount.publicKey));

  let lamports = await connection.getMinimumBalanceForRentExemption(
    COUNTER_SIZE
  );

  const createCounterAccountTx = SystemProgram.createAccount({
    fromPubkey: adminAccount.publicKey,
    newAccountPubkey: counterAccount.publicKey,
    lamports: lamports,
    space: COUNTER_SIZE,
    programId: programId,
  });

  const tx = new Transaction();
  tx.add(createCounterAccountTx);
  const hash = await connection.sendTransaction(tx, [
    adminAccount,
    counterAccount,
  ]);
  await connection.confirmTransaction(hash);
});

test("account intialized", async () => {
  let counterData = await connection.getAccountInfo(counterAccount.publicKey);
  let counter = borsh.deserialize(schema, counterData?.data);
  console.log(counter.count);
  expect(counter.count).toBe(0);
});
