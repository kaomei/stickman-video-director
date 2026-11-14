"""B6 media-use boundary, independent of editable project fixture/review flags.

Known reference/example/test media may guide NEW paintings or be compared in
review. Their bytes are never new-story production layers. SHA matching is
path-independent: copying or renaming a protected file does not change its role.
This is an accidental-reuse guard, not a claim of visual similarity detection.
"""
from pathlib import Path
from contextlib import contextmanager
import hashlib, os, site, sys, sysconfig

PROTECTED_MEDIA = {'0065f8654cd3bde8fa05c44d7ea18ad22a91cfbc8f5dbb97a91aa8792d333529': [{'path': 'assets/b6/characters/parcel_runner/front/cuff-right.png',
                                                                       'role': 'bundled-example-or-test'}],
 '034bcf2fedf2de2a0be9c78104e80c285a269f93a89990f48bb5cb0b6dbe7aa1': [{'path': 'assets/b6/characters/kiosk_keeper/front/body.png',
                                                                       'role': 'bundled-example-or-test'}],
 '07b49425c7f23706c1b8f0792b7622ce836c80c3176cea9eb0c786ea3e4b8f63': [{'path': 'assets/b6/paint/buyer-side-body.png',
                                                                       'role': 'bundled-example-or-test'}],
 '0a4525f9826b6fba301c545f19571d72a8f30f54a3d44817e624867342cdc439': [{'path': 'assets/b6/paint/coins.png',
                                                                       'role': 'bundled-example-or-test'}],
 '0b37f319c8e1def79adfadd3da01c60c189bf3e463fe63fc90130264fc5851e6': [{'path': 'assets/b6/characters/kiosk_keeper/front/cuff-right.png',
                                                                       'role': 'bundled-example-or-test'}],
 '0f39bd1e55a90a4009dbdbc2954421b968bab088b004a9cd31653ebbbbfbd448': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-motion-v52/assets/street-shoe-b.png',
                                                                       'role': 'bundled-example-or-test'}],
 '0f6814b002a919a09ea13a163d4b2644f2de04d2a4be81935dcb201c34e55429': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-motion-v52/assets/owner-hand.png',
                                                                       'role': 'bundled-example-or-test'}],
 '0fbd76d8efbbd26431d8531099cad0aedf6f103e980d8a688712a892cdee35ca': [{'path': 'assets/b6/paint/study-panorama.png',
                                                                       'role': 'bundled-example-or-test'}],
 '10a152611a23384c5037040b7e9840c3c8e55b1295921a288ea82a836ba827ab': [{'path': 'assets/b6/characters/parcel_runner/front/body.png',
                                                                       'role': 'bundled-example-or-test'}],
 '12e73ef62653a9375d3405c99b5c6ea22f6b6320586ca21a1f6352e7c36bf2e5': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-empty-gun-preview-v71/assets/room-clean.png',
                                                                       'role': 'bundled-example-or-test'}],
 '1437e6ac129d6d8dbd38b38b6142a0c2e99552a8913989034a3fc2dbd9b2c7da': [{'path': 'assets/b6/reference/approved-character-v21b.png',
                                                                       'role': 'quality-reference'}],
 '14f1ef1ca698cee99c14216474b81bc9b640fe0cbd257e9aa73d8b247131cdae': [{'path': 'assets/b6/characters/kiosk_keeper/side/head.png',
                                                                       'role': 'bundled-example-or-test'}],
 '15871c07e2dcbc6402ad8d54097d541676fa854f4d3b3d75b152b9ce5824cf73': [{'path': 'assets/b6/characters/parcel_runner/three_quarter/body.png',
                                                                       'role': 'bundled-example-or-test'}],
 '176f1b0183111f9ec67518fda5a25e2cca2106a91587f0bfc58398f4f4735e43': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-environment-v67/assets/coral-right.png',
                                                                       'role': 'bundled-example-or-test'}],
 '1814ba219dcfe4167afe2ca02ffbe341b6f3bc341308ad002341040eb2b7d3e4': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-environment-v67/assets/briefcase-left.png',
                                                                       'role': 'bundled-example-or-test'}],
 '19848727674d1d44917eb01c716273c12dec6b77335141bffe7fc206dcf73c26': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-patrons-v65/assets/tea-shirt.png',
                                                                       'role': 'bundled-example-or-test'}],
 '1ec3442bb377303631868887ee8a26c2ee245acbe10e77476486ba3f87162be3': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-motion-v52/assets/hero-hand.png',
                                                                       'role': 'bundled-example-or-test'}],
 '1f43f2a99e94a3c1620e13161490fb65525ea2c8bde9ef5ddc85f3fdd63805f5': [{'path': 'assets/b6/paint/hero-head.png',
                                                                       'role': 'bundled-example-or-test'}],
 '2376aaef71b252d6794a6ee6abcb3988225d61c5dd84cb0717958396ba00b140': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-empty-gun-preview-v71/assets/strong-body.png',
                                                                       'role': 'bundled-example-or-test'}],
 '2f7c580fbf4ea8c931d9c6295781fd1cb14d3c17bdfe7d65449cf9750d92822b': [{'path': 'assets/b6/characters/parcel_runner/side/cuff-left.png',
                                                                       'role': 'bundled-example-or-test'}],
 '2f9a144f08028d597f9fcdd7edac5257c5a311177c64e821ca4ee07af553010a': [{'path': 'assets/b6/paint/hero-back-body.png',
                                                                       'role': 'bundled-example-or-test'}],
 '324eb5efac664fbe4f908cd172d89a331122bc1c39b0730bb5787189fafedbaf': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-motion-v52/assets/awning.png',
                                                                       'role': 'bundled-example-or-test'}],
 '3408727ce200d1bc6d31d063fdba4332e4038a7d45997a51ed9f528eda4e8396': [{'path': 'assets/b6/paint/horse-leg-0.png',
                                                                       'role': 'bundled-example-or-test'}],
 '3947149fb1c829c11588f982d4cda0d953b529284308764f948804594d3fc5d5': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-v76-multiscene/assets/arcade-wide.png',
                                                                       'role': 'bundled-example-or-test'}],
 '3968d84186286ba1275c67d503e5b7feab9bbf9a4c59f4a5d8c3cf7172393b54': [{'path': 'assets/b6/paint/hero-side-body.png',
                                                                       'role': 'bundled-example-or-test'}],
 '3bc7ba72f4d2247ec9c4f64d7effa73d71739d4f7f8cdf6615d288d8dcca46d9': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-patrons-v65/assets/newspaper.png',
                                                                       'role': 'bundled-example-or-test'}],
 '3d370aa7731c2a2f667050abfbaa881e77b4d2e811964e55e35a8b699838f590': [{'path': 'assets/b6/characters/kiosk_keeper/hand.png',
                                                                       'role': 'bundled-example-or-test'},
                                                                      {'path': 'assets/b6/characters/parcel_runner/hand.png',
                                                                       'role': 'bundled-example-or-test'},
                                                                      {'path': 'assets/b6/paint/hero-hand.png',
                                                                       'role': 'bundled-example-or-test'}],
 '412c9bd3be25447950c905a83306f39c399d5e1f821f14d768302940ae949f72': [{'path': 'assets/b6/characters/parcel_runner/three_quarter/cuff-right.png',
                                                                       'role': 'bundled-example-or-test'}],
 '43b70b46f98d89a5341f3d108cde26c2ed3fc9a3286eca6fcd992f81f386ad61': [{'path': 'assets/b6/characters/parcel_runner/side/body.png',
                                                                       'role': 'bundled-example-or-test'}],
 '45c76e806daaf053cf35086d4e9b15fca360472bd714b7bc1fde7e5ad2da54f8': [{'path': 'assets/b6/characters/parcel_runner/front/cuff-left.png',
                                                                       'role': 'bundled-example-or-test'}],
 '4a483a60300e17c171b673633a262bfd1cc91962265a549bedb4b131f4304e8c': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-empty-gun-preview-v71/assets/near-counter.png',
                                                                       'role': 'bundled-example-or-test'}],
 '4c2f0586a0efbd9c517611c744b91e945fd0339020a4b2f886e39c65cd26494c': [{'path': 'assets/b6/paint/hero-front-head.png',
                                                                       'role': 'bundled-example-or-test'}],
 '4f14bc7605ef8cbcee9d49c6a9673ebadbafde1def165bd859fe88d9473f996e': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-motion-v52/assets/receipt.png',
                                                                       'role': 'bundled-example-or-test'}],
 '4f5b568208725e105ea16e4c443fffc8937e92e0993974a6c16f98339d5a1788': [{'path': 'assets/b6/characters/parcel_runner/side/cuff-right.png',
                                                                       'role': 'bundled-example-or-test'}],
 '514ff00697d25d1a49ae0d0f56358b5f16b2927482b48aa3800e48d9994960f9': [{'path': 'assets/b6/characters/parcel_runner/front/head.png',
                                                                       'role': 'bundled-example-or-test'}],
 '53060f6dc8f4a173b30bed1a8018c742273d164b1f9fb836addf3225b8f58fe8': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-empty-gun-preview-v71/assets/table-front.png',
                                                                       'role': 'bundled-example-or-test'}],
 '536b2bc485b3dfcab28a4d7439bd567873ae4d5f549436255c24ba51358ddf72': [{'path': 'assets/b6/paint/horse-leg-1.png',
                                                                       'role': 'bundled-example-or-test'}],
 '54b2416aea627556caca4e4680e70c99f2fe77aa18c90bc3e49994571edbd641': [{'path': 'assets/b6/paint/foreground-lamp.png',
                                                                       'role': 'bundled-example-or-test'}],
 '5abce3005cdcbca2796d2f99fbfa7a31569423b75cb9731bc0f01c1d727e97f9': [{'path': 'assets/b6/characters/parcel_runner/three_quarter/cuff-left.png',
                                                                       'role': 'bundled-example-or-test'}],
 '5b6d72e5b5a0510000ac345aeddab00d4692af6e66af2a2f53e35e65b5724b55': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-patrons-v65/assets/paper-left-hand.png',
                                                                       'role': 'bundled-example-or-test'}],
 '5d5578800ce80423bfed881400356070a332d41ab5fe16abc7d21706d9da2391': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-motion-v52/assets/owner-head.png',
                                                                       'role': 'bundled-example-or-test'}],
 '5e546e739eb21d3ea1122b9518432d93bab7c539ea83cb959305780c84d42df8': [{'path': 'assets/b6/paint/table.png',
                                                                       'role': 'bundled-example-or-test'}],
 '5fb53eb1d9b0c9f106f0e714b0fcc456e835522cfec002879ef519b3fe1c1c06': [{'path': 'assets/b6/characters/kiosk_keeper/side/body.png',
                                                                       'role': 'bundled-example-or-test'}],
 '5ffb7d51954cb8e8bd108af025abb21ee3195d87c0be6067035fcb42bbea7092': [{'path': 'assets/b6/characters/two-character-three-view-sheet.jpg',
                                                                       'role': 'bundled-example-or-test'}],
 '611e431541688153cd3e545d7b9f15af0f0c5875cdafa5306bf9c58a42f9bc9b': [{'path': 'assets/b6/hong-kong-v90/audio/master.m4a',
                                                                       'role': 'bundled-example-or-test'}],
 '62e71ec310c251724233a7b18a821e646d59eb643efa68978b2c39b975921e27': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-motion-v52/assets/street-head.png',
                                                                       'role': 'bundled-example-or-test'}],
 '65ae6e5b6825886f81c2868b5da8bf6ad0d5de7c66e4559f4f13cd77b98fac39': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-environment-v67/assets/coral-left.png',
                                                                       'role': 'bundled-example-or-test'}],
 '667e527da9cb77a3bb6b1f0e76a417a3a337629838278aadbeff147789f4d68f': [{'path': 'assets/b6/characters/kiosk_keeper/three_quarter/head.png',
                                                                       'role': 'bundled-example-or-test'}],
 '677ca4b45197a9545e1c161f964ef5b5b0b47ea130b99d2121e40584f24ad5e9': [{'path': 'assets/b6/reference/eiffel-16x9.mp4',
                                                                       'role': 'quality-reference'}],
 '6788dfe668a88e30fd80f103b2cc1c8bf7b1c6ccc378568ea8941a34b03466ff': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-kitchen-motion-v64/assets/chef-body.png',
                                                                       'role': 'bundled-example-or-test'}],
 '67f8ff6424b41ab7ad185919b4842eaea6b399713a523df95c245fa3300e09df': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-environment-v67/assets/street-separated.png',
                                                                       'role': 'bundled-example-or-test'}],
 '68803de4fa5f14824b0ca10c0386c2358e847e07ade821c3fc2a6ff9bdd3fdcb': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-motion-v52/assets/street-body.png',
                                                                       'role': 'bundled-example-or-test'}],
 '6e5a4653f7f48d62a0ed5fc02257b818c9254a5f5081560f1ac0e12cbaf2e07a': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-motion-v52/assets/cafe-clean-generated.png',
                                                                       'role': 'bundled-example-or-test'}],
 '71faaa0770e6ddce010d8afc5f699b8d383318a974808231744707270f9b93c7': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-empty-gun-preview-v71/assets/strong-head-blink.png',
                                                                       'role': 'bundled-example-or-test'}],
 '7251a29080c378b1eb0084aa461b7d6a3aa62959c08567aff1d75d110d269a2d': [{'path': 'assets/b6/characters/parcel_runner/three_quarter/head.png',
                                                                       'role': 'bundled-example-or-test'}],
 '78c980cb69a772fdc40bb589e84e4513150a7950c8f0c8a44ead8f3ab5547afd': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-arm-fix-v60/assets/owner-original-garment.png',
                                                                       'role': 'bundled-example-or-test'}],
 '7a5217dd33739566e8b2416c0ae0c2e41be8657312fb11a2af44ab576527322e': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-motion-v52/assets/crates.png',
                                                                       'role': 'bundled-example-or-test'}],
 '7c152ce54b2ce4278143a63ec209330505bed5714c4d5b3a71f2fe29ff8b2428': [{'path': 'assets/b6/hong-kong-v90/source/work/eiffel-preview-20s/space-camera-v29/layers/ink-stroke.png',
                                                                       'role': 'bundled-example-or-test'},
                                                                      {'path': 'assets/b6/paint/ink-stroke.png',
                                                                       'role': 'bundled-example-or-test'}],
 '7cbd434c9946c53a693f5764da8676d81716e4cf9aec318cf5ccfe46a0ef2db4': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-kitchen-motion-v64/assets/chef-left-hand.png',
                                                                       'role': 'bundled-example-or-test'}],
 '7e56bd84f46d1efdbeafd3d58771bddad6a45c719053aad84b5e9200a2a540b1': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-motion-v52/assets/taxi.png',
                                                                       'role': 'bundled-example-or-test'}],
 '811873d6dd93d4d9d01dbb73c4dfb388486829be402adc3416e9286e086ed705': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-empty-gun-preview-v71/assets/patron-cup.png',
                                                                       'role': 'bundled-example-or-test'}],
 '8274c57c703b535b1d46b1e7218574c05b49445aea90426da982703bfa7c72bf': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-empty-gun-preview-v71/assets/strong-tight-blink.png',
                                                                       'role': 'bundled-example-or-test'}],
 '82b24b6601353b38461147bc0f81da39076c50797b85f33e11c38aa987d28560': [{'path': 'assets/b6/reference/landscape-v45-excerpt.mp4',
                                                                       'role': 'quality-reference'}],
 '843617f3f4d5809b84ec6f826c8c264a92c3cd3275b6590eb9f371e27921ecfe': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-empty-gun-preview-v71/assets/bun-whole.png',
                                                                       'role': 'bundled-example-or-test'}],
 '8663645bf6a81a7b03985f656b97b68b7c0664c7f73ab1927e1969bad84c4f6a': [{'path': 'assets/b6/paint/carriage-body.png',
                                                                       'role': 'bundled-example-or-test'}],
 '880891da036218885b6532f4a3fdb2ccb9914649ac559dd5fe2cf575908979c5': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-patrons-v65/assets/patrons-clean.png',
                                                                       'role': 'bundled-example-or-test'}],
 '8987d41abddca39e8dfc494cd2527ef5ad257f78b3d792b56527e32bab1e34ce': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-empty-gun-preview-v71/assets/strong-bite.png',
                                                                       'role': 'bundled-example-or-test'}],
 '89e52cd939cd1bd29adf89680b812964ce62f1676b1ad7b495f1afa64e36bde0': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-empty-gun-preview-v71/assets/strong-tight.png',
                                                                       'role': 'bundled-example-or-test'}],
 '8a7442383b358be997d038231eb7e818dd420ea3d1becac864eb4b85f035225e': [{'path': 'assets/b6/characters/kiosk_keeper/front/head.png',
                                                                       'role': 'bundled-example-or-test'}],
 '8b35947affb21cdf65fec92d0caa7f23a0ffdf6d6e3a393bacbb9ca341f12ad7': [{'path': 'assets/b6/characters/kiosk_keeper/side/cuff-right.png',
                                                                       'role': 'bundled-example-or-test'}],
 '8d6e7df26365124642d438c9923fe5a4ad5ac1c95df85bc60284c3bd02393253': [{'path': 'assets/b6/characters/kiosk_keeper/three_quarter/cuff-right.png',
                                                                       'role': 'bundled-example-or-test'}],
 '8ded6ad4c2df732a77d8643dd56680b59ddae4b0aceb3d59e9b769051d36b61a': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-kitchen-motion-v64/assets/pot-lid.png',
                                                                       'role': 'bundled-example-or-test'}],
 '8fe0ab11496fb7139be0a1f646c547ca59b9e309967a16f04a14b64155aad7a4': [{'path': 'assets/b6/paint/buyer-body.png',
                                                                       'role': 'bundled-example-or-test'}],
 '9088c60f41d9b928bf402727db84649d0ce710b8c89d86b9b0bad32c03a1d772': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-environment-v67/assets/coral-upper.png',
                                                                       'role': 'bundled-example-or-test'}],
 '949d3ac5300c3287b126dc40ee45a5679fbe6567b3e56afe1323760263d395d8': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-kitchen-motion-v64/assets/chef-head.png',
                                                                       'role': 'bundled-example-or-test'}],
 '96b39c921caddf389da894d9e844257cefe6ce7b0d26550160803dff72a6fe9f': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-motion-v52/assets/street-shoe-a.png',
                                                                       'role': 'bundled-example-or-test'}],
 '98520bcba2303ff39127a75dc6816e1e1ede4ef29246fe2fbe4acff061bc38ae': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-patrons-v65/assets/tea-cup.png',
                                                                       'role': 'bundled-example-or-test'}],
 '9a1b850879276d196f76f5d9c65821599427301e523427c31ce90fca7cb614fb': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-empty-gun-preview-v71/assets/patron-paper.png',
                                                                       'role': 'bundled-example-or-test'}],
 '9f81c130a139966f7bb711a81d968f07185bfceb5a03e2c33a0491c6a11ade59': [{'path': 'assets/b6/paint/wheel-1.png',
                                                                       'role': 'bundled-example-or-test'}],
 'a50ce0625507fed8936f005e518fcc51f8b39aa62c722917b44f396c793cb901': [{'path': 'assets/b6/paint/hero-back-head.png',
                                                                       'role': 'bundled-example-or-test'}],
 'a5200c5c385d1fb7295c9c77f65a113f5422fa3818ad843589821efb164bb9ab': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-kitchen-motion-v64/assets/chef-right-hand.png',
                                                                       'role': 'bundled-example-or-test'}],
 'add28a0940ba591573103edf37ab0640346463e336bd424b5cf3d8a136bbb35f': [{'path': 'assets/b6/paint/paris-panorama.png',
                                                                       'role': 'bundled-example-or-test'}],
 'ae31b8a651d9a47533e47b430908927af3ebbdc8493ca4e1b34c9b924ae547a0': [{'path': 'assets/b6/characters/kiosk_keeper/three_quarter/body.png',
                                                                       'role': 'bundled-example-or-test'}],
 'b0047f5889a7ca1fd47097d8c8b3db054ef412e2f4a7297d3fe04fc1083e5d79': [{'path': 'assets/b6/reference/eiffel-portrait-v44.mp4',
                                                                       'role': 'quality-reference'}],
 'b1071cdd85f08ba06dd6137d6ddf4bf7b933d872b0f64387cf2d60b49b77ade8': [{'path': 'assets/b6/paint/hotel-panorama.png',
                                                                       'role': 'bundled-example-or-test'}],
 'b5655748228e61a18acce5d8c0b57beb5d6e85cbe8dc20a53f9627ae9552701c': [{'path': 'assets/b6/paint/horse-leg-3.png',
                                                                       'role': 'bundled-example-or-test'}],
 'b5d906f9eed6b72d93825306049d7a9b4e7475424de4cd262ab23f79d719484a': [{'path': 'assets/b6/reference/hong-kong-v90-20s.mp4',
                                                                       'role': 'quality-reference'}],
 'b97758940113d53cbd053f9af1649ce790403ada08f88e8b58bc46da0a7f8670': [{'path': 'assets/b6/characters/parcel_runner/side/head.png',
                                                                       'role': 'bundled-example-or-test'}],
 'bc13d818ee1dd81ce4c3931f8f6917e9813321e037d6eeb602593d86e0e1bfa9': [{'path': 'assets/b6/paint/buyer-greedy-head.png',
                                                                       'role': 'bundled-example-or-test'}],
 'c0486feb167a820ee4be3200e14af8796d7109d9a95a239b539ba00e91b49784': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-motion-v52/assets/grocery-bag.png',
                                                                       'role': 'bundled-example-or-test'}],
 'c12465b037219c0dd6fdd16a2667df2a651aad594ad1cc3579b5835cc63f7d46': [{'path': 'assets/b6/characters/kiosk_keeper/three_quarter/cuff-left.png',
                                                                       'role': 'bundled-example-or-test'}],
 'c5b8ecc4b756639ff7c40d7e8c42f521c69196f97828d4f166113421092ed944': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-kitchen-motion-v64/assets/kitchen-clean.png',
                                                                       'role': 'bundled-example-or-test'}],
 'ccdedea5d70b38483ba1bfdb85ca3f44a0256c2843243ff60992e92239c372db': [{'path': 'assets/b6/reference/portrait-v44-excerpt.mp4',
                                                                       'role': 'quality-reference'}],
 'cd0361401ef9b6550f2e81f860c0347412ddaac95ebf9869a391de140d23ad53': [{'path': 'assets/b6/characters/kiosk_keeper/shoe-right.png',
                                                                       'role': 'bundled-example-or-test'},
                                                                      {'path': 'assets/b6/characters/parcel_runner/shoe-right.png',
                                                                       'role': 'bundled-example-or-test'},
                                                                      {'path': 'assets/b6/paint/shoe-right.png',
                                                                       'role': 'bundled-example-or-test'}],
 'cdbb6deb3eb41bf7c5fc48d10ccf53f2ee5ea933e3723924c4513a111b99217c': [{'path': 'assets/b6/paint/letter.png',
                                                                       'role': 'bundled-example-or-test'}],
 'd3c5fb0f3203c64b992bd367410ee3b4851a93542353fc43bd4605c9967c9fa0': [{'path': 'assets/b6/paint/foreign-panorama.png',
                                                                       'role': 'bundled-example-or-test'}],
 'd3efd17228016d168fb2fb2eae15eeaee31a3c13c31720554b7df22e5c47d1b4': [{'path': 'assets/b6/characters/kiosk_keeper/side/cuff-left.png',
                                                                       'role': 'bundled-example-or-test'}],
 'dfe6ef84899053c8eeed85c6a3266af7661a5153b820c982b760596f6d6d92dd': [{'path': 'assets/b6/paint/wheel-0.png',
                                                                       'role': 'bundled-example-or-test'}],
 'e4e2c9c3da7f472f0b3c292714b82d4a1aac3a9d988615679de92def424ddfda': [{'path': 'assets/b6/paint/horse-leg-2.png',
                                                                       'role': 'bundled-example-or-test'}],
 'e89628a0c470b61da139d12ee38e2f8c9fda8d6e448637483809aff383853bc1': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-empty-gun-preview-v71/assets/plate.png',
                                                                       'role': 'bundled-example-or-test'}],
 'ebdf213e29b267b2019fa4807d169000f327d06ed9dc5f1694a2051669d009f9': [{'path': 'assets/b6/paint/hero-body.png',
                                                                       'role': 'bundled-example-or-test'}],
 'ec55a96b21eed4f428a9a4125890d92733474e3bed31bc1064710699fc768863': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-empty-gun-preview-v71/assets/strong-head.png',
                                                                       'role': 'bundled-example-or-test'}],
 'ed15f358516f4c9ded6a6564707eb79af922b670f16985d4aacc7a5bede8324c': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-environment-v67/assets/briefcase-upper.png',
                                                                       'role': 'bundled-example-or-test'}],
 'f18d1d7756ccf8254f074669a1a416d7107c9ebbc801da2425605906ab4b8619': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-1990s-environment-v67/assets/briefcase-right.png',
                                                                       'role': 'bundled-example-or-test'}],
 'f3c62269e7f25f132551f2bb59bc131fee91c1eaeb7494dbde552289948b3b5a': [{'path': 'assets/b6/paint/hero-side-head.png',
                                                                       'role': 'bundled-example-or-test'}],
 'f523cac45ae256a9edf39224f0850251c341e554a54b65d19142389c326fc6c7': [{'path': 'assets/b6/paint/buyer-side-head.png',
                                                                       'role': 'bundled-example-or-test'}],
 'f70a7c73a8d489cc5fb00d38697a2fa33870ca61955f279d3a31c322bbf9f273': [{'path': 'assets/b6/paint/buyer-head.png',
                                                                       'role': 'bundled-example-or-test'}],
 'f98756016032aee493f0823191498a642481a4d7c5b7ef00f6e0748f13ef0730': [{'path': 'assets/b6/characters/kiosk_keeper/front/cuff-left.png',
                                                                       'role': 'bundled-example-or-test'}],
 'fd55a0fbf736d278809e1fc177ff6a2b972b5d219745c2fcbaf90e8dbe029d7a': [{'path': 'assets/b6/characters/kiosk_keeper/shoe-left.png',
                                                                       'role': 'bundled-example-or-test'},
                                                                      {'path': 'assets/b6/characters/parcel_runner/shoe-left.png',
                                                                       'role': 'bundled-example-or-test'},
                                                                      {'path': 'assets/b6/paint/shoe-left.png',
                                                                       'role': 'bundled-example-or-test'}],
 'fff002463e46447ec723d9a4f04fec1646dd01918ac6b00eb7a8b6906a8f7861': [{'path': 'assets/b6/hong-kong-v90/source/work/hk-empty-gun-preview-v71/assets/strong-speak.png',
                                                                       'role': 'bundled-example-or-test'}]}
FIXTURE_SCENES = {'204a3faa0819af7a2d4774dcc8dc9ace31bbcf3acd7920a9138e65dfcc1cd711': 'diagnostic',
 '28c305b7f3f217dc071bdf4788b20e1ff79b2d670cb9a8bcc7579e8afe01cd77': 'diagnostic',
 'dffaba09358cfdeafc9a3a04f29483910f4a8667159fbdbd60094b9185239947': 'example-reproduction'}

def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def classify(project, scene_sha):
    intrinsic=FIXTURE_SCENES.get(scene_sha)
    # Flags may only DOWNGRADE a project. Deleting them cannot promote a known
    # test scene, old renderer or locked example to production.
    if project.get('character_system',{}).get('mode')=='locked-v90-performance':
        return 'example-reproduction'
    if intrinsic:return intrinsic
    if project.get('version',1)<2 or project.get('technical_fixture') or project.get('purpose') in ('diagnostic','example-reproduction'):
        return 'diagnostic'
    return 'production'

def audit_inputs(base, files, purpose):
    hits=[]
    for rel in sorted(set(files)):
        path=(Path(base)/rel).resolve()
        if not path.is_file():continue
        known=PROTECTED_MEDIA.get(digest(path))
        if known:hits.append({'path':rel,'known_sources':known})
    if purpose=='production' and hits:
        raise ValueError('Protected B6 reference/example/test media cannot be new-story production inputs (copying/renaming is not authoring): '+', '.join(h['path'] for h in hits)+'. Use them for comparison/style reference only; author story-specific paintings and original-speed audio.')
    return hits

# These suffixes are a fast rejection path, not the content boundary. Pillow
# probing and protected-byte matching below also cover extensionless/renamed art.
MEDIA_SUFFIXES=frozenset({
    '.png','.jpg','.jpeg','.webp','.gif','.bmp','.tif','.tiff','.avif','.heic',
    '.ico','.icns','.psd','.eps','.svg','.pdf','.mp4','.m4v','.mov','.avi',
    '.mkv','.webm','.flv','.wav','.mp3','.m4a','.aac','.flac','.ogg','.opus',
    '.aiff','.aif','.au','.wma','.ttf','.otf','.woff','.woff2',
})

def actual_reads_scope(base, reads, purpose='production'):
    """Audit ordinary authored reads without changing the frozen V90 engine.

    Imports/frames may use installed Python dependencies. Story media, including
    image formats known to Pillow and renamed protected bytes, must be local.
    This is not a sandbox against native I/O or malicious interpreter changes.
    """
    base=Path(base).resolve();state={'depth':0,'checking':False};cache={}
    library_roots={Path(p).resolve() for key,p in sysconfig.get_paths().items()
                   if key in {'stdlib','platstdlib','purelib','platlib'} and p}
    # Preserve package-resource reads for active environments whose site-packages
    # directory is supplied through sys.path rather than sysconfig.
    library_roots.update(Path(p).resolve() for p in sys.path
                         if p and Path(p).name in {'site-packages','dist-packages'})
    # A user-site install can be importable without appearing as a literal
    # site-packages entry in sys.path (for example an importer/bootstrapper).
    user_sites=site.getusersitepackages()
    if isinstance(user_sites,str):user_sites=[user_sites]
    library_roots.update(Path(p).resolve() for p in [*site.getsitepackages(),*user_sites] if p)
    from PIL import Image
    library_roots.add(Path(Image.__file__).resolve().parent)
    # Register all decoders before an authored read is audited. Lazy plugin
    # imports from inside Image.open otherwise re-enter the media probe while
    # that same plugin is only partially initialized.
    Image.init()
    def external_media(path):
        stat=path.stat();key=(str(path),stat.st_size,stat.st_mtime_ns)
        if key in cache:return cache[key]
        if path.suffix.lower() in MEDIA_SUFFIXES:
            result=True
        else:
            # Bounded memory; one inspection per unchanged external file. Exact
            # bytes also catch known non-Pillow media under arbitrary names.
            digest=hashlib.sha256()
            with path.open('rb') as stream:
                header=stream.read(64);digest.update(header)
                for chunk in iter(lambda:stream.read(1024*1024),b''):digest.update(chunk)
            result=(digest.hexdigest() in PROTECTED_MEDIA or
                    header.startswith((b'ID3',b'fLaC',b'OggS',b'FORM',b'\x1aE\xdf\xa3',b'FLV')) or
                    header[:4] in {b'RIFF',b'RIFX'} or header[4:8]==b'ftyp' or
                    (len(header)>1 and header[0]==255 and header[1]&224==224))
            if not result:
                try:
                    with Image.open(path):pass
                    result=True
                except Image.DecompressionBombError:
                    result=True
                except (OSError,ValueError,SyntaxError):
                    result=False
        if len(cache)>=256:cache.clear()
        cache[key]=result;return result
    def audit(event,args):
        if event!='open' or not state['depth'] or state['checking']:return
        name,mode=args[:2]
        if not isinstance(name,(str,bytes)):return
        flags=args[2] if len(args)>2 else 0
        if isinstance(mode,str):
            if any(letter in mode for letter in 'wax') and '+' not in mode:return
        elif flags & os.O_ACCMODE==os.O_WRONLY:return
        path=Path(os.fsdecode(name)).resolve()
        if path.is_relative_to(base):
            # Include read/write handles omitted by the historical engine audit.
            reads.add(str(path.relative_to(base)));return
        if any(path.is_relative_to(root) for root in library_roots):return
        if not path.is_file():return
        state['checking']=True
        try:is_media=external_media(path)
        finally:state['checking']=False
        if is_media:
            raise ValueError('External media dependency in production scene: '+str(path)+
                             '; prepare declared project-local inputs. Reference/example/test media remain comparison-only.')
    if purpose=='production':sys.addaudithook(audit)
    @contextmanager
    def scope():
        state['depth']+=1
        try:yield
        finally:state['depth']-=1
    return scope
