module MyApp::my_coin {
    use std::signer;

    struct MoonCoin {}

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
        aptos_framework::managed_coin::mint<MoonCoin>(sender, signer::address_of(sender), init_supply);
    }
}
