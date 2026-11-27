#!/bin/sh
# 公開前に実行: キャッシュ用の番号とversion.jsonを更新
v=$(date +%Y%m%d%H%M)
sed -i "s/?v=[0-9]\{12\}/?v=$v/g; s/window.HANA_V=\"[0-9]*\"/window.HANA_V=\"$v\"/" index.html
sed -i "s/?v=[0-9]\{12\}/?v=$v/g; s/window.HANA_V=\"[0-9]*\"/window.HANA_V=\"$v\"/" admin/index.html
echo "{\"v\":\"$v\"}" > version.json
