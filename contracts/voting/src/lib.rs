#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, vec, Address, Env, Map, String, Symbol,
    Vec,
};

// ─── Data Types ──────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Poll {
    pub id: u64,
    pub question: String,
    pub options: Vec<String>,
    pub vote_counts: Map<u32, u64>, // option_index → vote count
    pub creator: Address,
    pub is_active: bool,
    pub total_votes: u64,
}

#[contracttype]
pub enum DataKey {
    PollCount,
    Poll(u64),
    HasVoted(u64, Address), // (poll_id, voter) → bool
    Admin,
}

// ─── Contract ────────────────────────────────────────────────────────────────

#[contract]
pub struct VotingContract;

#[contractimpl]
impl VotingContract {
    // ── Initialize ──────────────────────────────────────────────────────────

    /// Initialize the contract with an admin address.
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::PollCount, &0u64);
    }

    // ── Create Poll ─────────────────────────────────────────────────────────

    /// Create a new poll.  Returns the new poll's id.
    pub fn create_poll(
        env: Env,
        creator: Address,
        question: String,
        options: Vec<String>,
    ) -> u64 {
        creator.require_auth();

        // Validate
        if options.len() < 2 {
            panic!("at least 2 options required");
        }
        if options.len() > 10 {
            panic!("maximum 10 options allowed");
        }

        let poll_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::PollCount)
            .unwrap_or(0u64);

        let mut vote_counts: Map<u32, u64> = Map::new(&env);
        for i in 0..options.len() {
            vote_counts.set(i, 0u64);
        }

        let poll = Poll {
            id: poll_id,
            question,
            options,
            vote_counts,
            creator,
            is_active: true,
            total_votes: 0,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Poll(poll_id), &poll);
        env.storage()
            .instance()
            .set(&DataKey::PollCount, &(poll_id + 1));

        // Emit event
        env.events().publish(
            (symbol_short!("create"), symbol_short!("poll")),
            poll_id,
        );

        poll_id
    }

    // ── Vote ────────────────────────────────────────────────────────────────

    /// Cast a vote on a poll.
    pub fn vote(env: Env, voter: Address, poll_id: u64, option_index: u32) {
        voter.require_auth();

        // Check already voted
        let voted_key = DataKey::HasVoted(poll_id, voter.clone());
        if env.storage().persistent().has(&voted_key) {
            panic!("already voted");
        }

        let mut poll: Poll = env
            .storage()
            .persistent()
            .get(&DataKey::Poll(poll_id))
            .expect("poll not found");

        if !poll.is_active {
            panic!("poll is closed");
        }
        if option_index >= poll.options.len() {
            panic!("invalid option index");
        }

        // Increment vote count
        let current: u64 = poll.vote_counts.get(option_index).unwrap_or(0);
        poll.vote_counts.set(option_index, current + 1);
        poll.total_votes += 1;

        env.storage()
            .persistent()
            .set(&DataKey::Poll(poll_id), &poll);
        env.storage().persistent().set(&voted_key, &true);

        // Emit event
        env.events().publish(
            (symbol_short!("vote"), symbol_short!("cast")),
            (poll_id, option_index, voter),
        );
    }

    // ── Close Poll ──────────────────────────────────────────────────────────

    /// Close a poll (only creator or admin can close).
    pub fn close_poll(env: Env, caller: Address, poll_id: u64) {
        caller.require_auth();

        let mut poll: Poll = env
            .storage()
            .persistent()
            .get(&DataKey::Poll(poll_id))
            .expect("poll not found");

        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("not initialized");

        if caller != poll.creator && caller != admin {
            panic!("unauthorized");
        }

        poll.is_active = false;
        env.storage()
            .persistent()
            .set(&DataKey::Poll(poll_id), &poll);

        env.events().publish(
            (symbol_short!("close"), symbol_short!("poll")),
            poll_id,
        );
    }

    // ── View Functions ───────────────────────────────────────────────────────

    /// Get poll details.
    pub fn get_poll(env: Env, poll_id: u64) -> Poll {
        env.storage()
            .persistent()
            .get(&DataKey::Poll(poll_id))
            .expect("poll not found")
    }

    /// Get total number of polls created.
    pub fn get_poll_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::PollCount)
            .unwrap_or(0u64)
    }

    /// Check if an address has already voted on a given poll.
    pub fn has_voted(env: Env, poll_id: u64, voter: Address) -> bool {
        env.storage()
            .persistent()
            .has(&DataKey::HasVoted(poll_id, voter))
    }

    /// Get vote count for a specific option.
    pub fn get_vote_count(env: Env, poll_id: u64, option_index: u32) -> u64 {
        let poll: Poll = env
            .storage()
            .persistent()
            .get(&DataKey::Poll(poll_id))
            .expect("poll not found");
        poll.vote_counts.get(option_index).unwrap_or(0)
    }

    /// Get all vote results for a poll as a vector of counts.
    pub fn get_results(env: Env, poll_id: u64) -> Vec<u64> {
        let poll: Poll = env
            .storage()
            .persistent()
            .get(&DataKey::Poll(poll_id))
            .expect("poll not found");

        let mut results: Vec<u64> = vec![&env];
        for i in 0..poll.options.len() {
            results.push_back(poll.vote_counts.get(i).unwrap_or(0));
        }
        results
    }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, vec, Env, String};

    fn setup() -> (Env, VotingContractClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, VotingContract);
        let client = VotingContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        client.initialize(&admin);
        (env, client)
    }

    #[test]
    fn test_create_poll() {
        let (env, client) = setup();
        let creator = Address::generate(&env);
        let question = String::from_str(&env, "Best Stellar feature?");
        let options = vec![
            &env,
            String::from_str(&env, "Smart Contracts"),
            String::from_str(&env, "Fast Finality"),
            String::from_str(&env, "Low Fees"),
        ];
        let poll_id = client.create_poll(&creator, &question, &options);
        assert_eq!(poll_id, 0);
        assert_eq!(client.get_poll_count(), 1);
    }

    #[test]
    fn test_vote_and_results() {
        let (env, client) = setup();
        let creator = Address::generate(&env);
        let voter1 = Address::generate(&env);
        let voter2 = Address::generate(&env);

        let poll_id = client.create_poll(
            &creator,
            &String::from_str(&env, "Favourite chain?"),
            &vec![
                &env,
                String::from_str(&env, "Stellar"),
                String::from_str(&env, "Ethereum"),
            ],
        );

        client.vote(&voter1, &poll_id, &0); // votes for Stellar
        client.vote(&voter2, &poll_id, &0); // votes for Stellar

        let poll = client.get_poll(&poll_id);
        assert_eq!(poll.total_votes, 2);
        assert_eq!(client.get_vote_count(&poll_id, &0), 2);
        assert_eq!(client.get_vote_count(&poll_id, &1), 0);
    }

    #[test]
    fn test_has_voted() {
        let (env, client) = setup();
        let creator = Address::generate(&env);
        let voter = Address::generate(&env);

        let poll_id = client.create_poll(
            &creator,
            &String::from_str(&env, "Test?"),
            &vec![
                &env,
                String::from_str(&env, "Yes"),
                String::from_str(&env, "No"),
            ],
        );

        assert!(!client.has_voted(&poll_id, &voter));
        client.vote(&voter, &poll_id, &1);
        assert!(client.has_voted(&poll_id, &voter));
    }

    #[test]
    fn test_close_poll() {
        let (env, client) = setup();
        let creator = Address::generate(&env);

        let poll_id = client.create_poll(
            &creator,
            &String::from_str(&env, "Close test?"),
            &vec![
                &env,
                String::from_str(&env, "A"),
                String::from_str(&env, "B"),
            ],
        );

        client.close_poll(&creator, &poll_id);
        let poll = client.get_poll(&poll_id);
        assert!(!poll.is_active);
    }
}
