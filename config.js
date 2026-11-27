// ===== 花詩はなHP: 初期設定ファイル =====
// 「かんたん更新ページ」で保存した内容があれば、そちらが優先されます。
window.HANA = {
  // 試作中の閲覧パスワード(SHA-256)。公開時は '' にすると誰でも見られる
  gate:'b6351211106fc1fc6b1b3d6f6a4dcf92227e1231271227b3f58539fbb9a71711',
  schedule: {
    // 毎日の基本の配信枠
    default: [
      { time: '17:30', title: '定期雑談配信', memo: '夕方のゆる雑談' },
      { time: '22:00', title: '定期雑談配信', memo: '夜のまったり雑談' }
    ],
    // 曜日ごとの上書き(0=日 … 6=土)。[] ならお休み、配列ならその枠
    override: {}
  },

  news: [
    { date: '2026.11.24', text: '公式サイトができました🌸' },
    { date: '2026.11.24', text: '毎日17:30と22:00に定期雑談配信しています💗' }
  ],

  home: {
    serif: 'いらっしゃいませ、\n飼い主さん',
    serifs: [
      'いらっしゃいませ、\n飼い主さん',
      'おかえりなさい、\n待ってたよ',
      '今日もきてくれて\nありがとう',
      'ゆっくりしていってね'
    ],
    catch: 'ゆるっと毎日おしゃべり配信',
    sub: '雑談・歌・ゲームをのんびりお届け。\n専属飼い主さん、いつでも遊びにきてね。'
  },

  profile: {
    name: '花詩 はな',
    reading: 'はなうた はな',
    birthday: '7月5日',
    likes: '猫・甘いお菓子',
    content: '雑談・歌・ゲーム',
    fanname: '専属飼い主',
    tags: ['#はなちゃむとぬくぬく', '#はなちゃむアート'],
    hitokoto: 'はなの配信に来てくれてありがとう！\nのんびり雑談しながら、ゆるっと過ごせる場所を目指してます💗'
  },

  outfits: [
    { label: '🌸 桜和装', src: 'img/outfit-kimono.webp' },
    { label: '🩷 ナース', src: 'img/outfit-nurse.webp' },
    { label: '🐈‍⬛ 黒猫', src: 'img/outfit-gothic.webp' }
  ],

  gallery: [
    { src: 'img/gallery-1.webp' },
    { src: 'img/gallery-2.webp' },
    { src: 'img/gallery-3.webp' },
    { src: 'img/gallery-4.webp' },
    { src: 'img/gallery-5.webp' },
    { src: 'img/gallery-6.webp' },
    { src: 'img/gallery-7.webp' }
  ],

  links: [
    { name: 'Mirrativ', sub: '配信・アーカイブ', url: 'https://www.mirrativ.com/user/155617998' },
    { name: 'X', sub: '@hana_game0705', url: 'https://x.com/hana_game0705' },
    { name: 'ほしいものリスト', sub: '差し入れはこちら', url: 'https://gi-pt.com/main/wishlist/fan-view/3a1c81b3-83ed-ddc0-2f38-d302c37a3aaa' }
  ],

  // おみくじ(赤系の絵文字は使わない)
  omikuji: [
    { rank: '大吉', msg: 'きょうは何をやってもうまくいく予感！はなと一緒にぬくぬくしよ🌸', item: 'ラッキーアイテム：あまいお菓子' },
    { rank: '大吉', msg: 'うれしいお知らせが届くかも。ゆっくり深呼吸してみてね💗', item: 'ラッキーアイテム：ねこのぬいぐるみ' },
    { rank: '中吉', msg: 'のんびり過ごすのが吉。無理しすぎないでね。', item: 'ラッキーアイテム：あたたかい飲み物' },
    { rank: '中吉', msg: 'ちいさな幸せを見つけられる日。配信でお話ししよ🌸', item: 'ラッキーアイテム：ふわふわのブランケット' },
    { rank: '小吉', msg: 'ゆっくり進めばだいじょうぶ。おやつタイムが運気アップ！', item: 'ラッキーアイテム：コーヒー☕' },
    { rank: '吉', msg: 'いつもどおりがいちばん。はなの配信でひとやすみしてね💗', item: 'ラッキーアイテム：さくら色のもの' },
    { rank: '末吉', msg: 'あせらず、あわてず。あとから良いことがやってくるよ。', item: 'ラッキーアイテム：ねこ🐈' }
  ],

  // ===== 保存先(Supabase) =====
  // 空のままなら「試作モード」(この端末のブラウザ内にだけ保存)で動きます。
  supabase: {
    url: 'https://uglxilcwbgqoofnzngux.supabase.co',
    anonKey: 'sb_publishable_R83zSq90hslRd5jl04sIPg_hZlLxfRC',  // 公開用キー(公開してよい)
    tables: { messages: 'hana_messages', contacts: 'hana_contacts' }
  }
};
