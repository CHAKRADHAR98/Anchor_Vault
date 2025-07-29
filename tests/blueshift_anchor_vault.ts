import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BlueshiftAnchorVault } from "../target/types/blueshift_anchor_vault";
import { BN } from "bn.js";

describe("blueshift_anchor_vault", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.blueshiftAnchorVault as Program<BlueshiftAnchorVault>;

  let signer = anchor.web3.Keypair.generate();

  it("Deposit", async () => {
    await airdrop(program.provider.connection, signer.publicKey, 1000000000); // Airdrop 1 SOL to the signer
    
    // Manual account resolution if accountsPartial doesn't work
    let [vault_address, _vaultBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), signer.publicKey.toBuffer()],
      program.programId
    );
    
    // Use the raw transaction approach
    const tx = await program.methods
    .deposit(new anchor.BN(1_000_000))
    .accountsStrict({
      vault: vault_address,
      signer: signer.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([signer])
    .rpc();
    
    console.log("Your transaction signature", tx);
  });

  it("Withdraw", async () => {
    let [vault_address, _vaultBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), signer.publicKey.toBuffer()],
      program.programId
    );

    const tx = await program.methods
    .withdraw()
    .accountsStrict({
      vault: vault_address,
      signer: signer.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([signer])
    .rpc();
    
    console.log("Withdraw transaction signature", tx);
  });
});

export async function airdrop(
  connection: anchor.web3.Connection,
  publicKey: anchor.web3.PublicKey,
  amount: number = 1000000000 // 1 SOL
) {
  await connection.confirmTransaction(
    await connection.requestAirdrop(publicKey, amount),
    "confirmed"
  );
}