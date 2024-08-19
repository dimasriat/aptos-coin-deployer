module MyApp::my_coin {
    use aptos_framework::coin;
    use std::signer;
    use aptos_std::event;

    struct MoonCoin has key {}

    struct TransferOwnershipEvent has drop, store {
        old_owner: address,
        new_owner: address
    }

    struct TransferEvent has drop, store {
        from: address,
        to: address,
        amount: u64
    }

    struct MoonCoinInfo has key {
        mint: coin::MintCapability<MoonCoin>,
        freeze: coin::FreezeCapability<MoonCoin>,
        burn: coin::BurnCapability<MoonCoin>,
        owner: address,
        transfer_ownership_event: event::EventHandle<TransferOwnershipEvent>,
        transfer_event: event::EventHandle<TransferEvent>,
    }

    const MOON_COIN_TOKEN: address = @MyApp;

    fun init_module(sender: &signer) {
        aptos_framework::managed_coin::initialize<MoonCoin>(
            sender,
            b"Moon Coin",
            b"MOON",
            6,
            false,
        );

        aptos_framework::managed_coin::register<MoonCoin>(sender);

        let init_supply = 1000000000;

        if (!coin::is_account_registered<MoonCoin>(signer::address_of(sender))) {
            coin::register<MoonCoin>(sender);
        };

        aptos_framework::managed_coin::mint<MoonCoin>(sender, signer::address_of(sender), init_supply);
    }

    public entry fun register(sender: &signer) {
        if (!coin::is_account_registered<MoonCoin>(signer::address_of(sender))) {
            coin::register<MoonCoin>(sender);
        };
    }

    public entry fun transfer(sender: &signer, to: address, amount: u64) {
        // let from = signer::address_of(sender);
        coin::transfer<MoonCoin>(sender, to, amount);
        // let moon_coin_info = borrow_global_mut<MoonCoinInfo>(MOON_COIN_TOKEN);
        // event::emit_event<TransferEvent>(
        //     &mut moon_coin_info.transfer_event,
        //     TransferEvent {
        //         from,
        //         to,
        //         amount
        //     }
        // );
    }

}

