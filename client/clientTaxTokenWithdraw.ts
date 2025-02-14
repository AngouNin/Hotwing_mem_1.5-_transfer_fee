import {
    Connection,
    clusterApiUrl,
  PublicKey,
  } from "@solana/web3.js";
  import {
    TOKEN_2022_PROGRAM_ID,
    getTransferFeeAmount,
    harvestWithheldTokensToMint,
    unpackAccount,
    withdrawWithheldTokensFromAccounts,
    withdrawWithheldTokensFromMint,
  } from "@solana/spl-token";
  
  // Connection to devnet cluster
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  
  // Playground wallet
  const payer = pg.wallet.keypair;
  
  // Transaction signature returned from sent transaction
  let transactionSignature: string;
  const tokenMintAddress = '4brw3G9A6JTiaQLoPNDwQTuF3Hkj8KmfGMzeBsiBqYyv';
  const sourceWalletForFee = 'aW6TpCCnm1V7kkufPniPcYJs8Cn1xoMpg5z97jGTjLs';
  // Address for Mint Account
  const mint = new PublicKey(tokenMintAddress);
  const withdrawWithheldAuthority = pg.wallet.keypair;
  const sourceTokenAccountForTax = new PublicKey(sourceWalletForFee);
  
  // Retrieve all Token Accounts associated with the mint
  const allAccounts = await connection.getProgramAccounts(TOKEN_2022_PROGRAM_ID, {
    commitment: "confirmed",
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: mint.toString(), // Mint Account address
        },
      },
    ],
  });
  
  // List of Token Accounts to withdraw fees from
  const accountsToWithdrawFrom = [];
  
  for (const accountInfo of allAccounts) {
    const account = unpackAccount(
      accountInfo.pubkey, // Token Account address
      accountInfo.account, // Token Account data
      TOKEN_2022_PROGRAM_ID // Token Extension Program ID
    );
  
    // Extract transfer fee data from each account
    const transferFeeAmount = getTransferFeeAmount(account);
  
    // Check if fees are available to be withdrawn
    if (transferFeeAmount !== null && transferFeeAmount.withheldAmount > 0) {
      accountsToWithdrawFrom.push(accountInfo.pubkey); // Add account to withdrawal list
    }
  }
  
  // Withdraw withheld tokens from Token Accounts
  transactionSignature = await withdrawWithheldTokensFromAccounts(
    connection,
    payer, // Transaction fee payer
    mint, // Mint Account address
    sourceTokenAccountForTax, // Destination account for fee withdrawal
    withdrawWithheldAuthority, // Authority for fee withdrawal
    undefined, // Additional signers
    accountsToWithdrawFrom, // Token Accounts to withdrawal from
    undefined, // Confirmation options
    TOKEN_2022_PROGRAM_ID // Token Extension Program ID
  );
  
  console.log(
    "\nWithdraw Fee From Token Accounts:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
  );
  
  // Harvest withheld fees from Token Accounts to Mint Account
  transactionSignature = await harvestWithheldTokensToMint(
    connection,
    payer, // Transaction fee payer
    mint, // Mint Account address
    [sourceTokenAccountForTax], // Source Token Accounts for fee harvesting
    undefined, // Confirmation options
    TOKEN_2022_PROGRAM_ID // Token Extension Program ID
  );
  
  console.log(
    "\nHarvest Fee To Mint Account:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
  );
  
  // Withdraw fees from Mint Account
  transactionSignature = await withdrawWithheldTokensFromMint(
    connection,
    payer, // Transaction fee payer
    mint, // Mint Account address
    sourceTokenAccountForTax, // Destination account for fee withdrawal
    withdrawWithheldAuthority, // Withdraw Withheld Authority
    undefined, // Additional signers
    undefined, // Confirmation options
    TOKEN_2022_PROGRAM_ID // Token Extension Program ID
  );
  
  console.log(
    "\nWithdraw Fee from Mint Account:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
  );
  