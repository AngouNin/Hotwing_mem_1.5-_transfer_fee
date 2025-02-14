use anchor_lang::prelude::*;

declare_id!("7rmP5FyFBfzCLatmofkonxbv5WhFFQ71bwHAmWBECHXu");

#[program]
pub mod transfertax {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
