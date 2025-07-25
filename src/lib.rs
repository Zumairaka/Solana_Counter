use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};

use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize)]
enum InstructionType {
    Increase(u32),
    Decrease(u32),
}

#[derive(BorshSerialize, BorshDeserialize)]
struct Counter {
    count: u32,
}

entrypoint!(counter_contract);

pub fn counter_contract(
    _pubkey: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let acc = next_account_info(&mut accounts.iter())?;
    let instruction_type = InstructionType::try_from_slice(&instruction_data)?;
    let mut counter_data = Counter::try_from_slice(&mut acc.data.borrow())?;

    match instruction_type {
        InstructionType::Decrease(value) => {
            msg!("Processing Decrease");
            counter_data.count -= value;
        }
        InstructionType::Increase(value) => {
            msg!("Processing Increase");
            counter_data.count += value;
        }
    }

    counter_data.serialize(&mut *acc.data.borrow_mut())?;
    msg!("Counter Updated {}", counter_data.count);
    Ok(())
}
