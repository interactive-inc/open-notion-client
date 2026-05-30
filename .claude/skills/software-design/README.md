# software-design

Adopted design methods.

## Foundation

外側（利用者）から内側（実装）への同心円。

- Product Design ⇒ Garrett's UX 5 planes (Strategy, Scope)
- UI Design ⇒ OOUI + Garrett's UX 5 planes (Structure, Skeleton, Surface)
- Domain Design ⇒ Evans's DDD (Strategic only, conceptual)
- Code Design ⇒ Beck's Simple Design + Layered Architecture

Tactical DDD（Aggregate / Entity / VO 実装）は Code Design に置く。

## Policy

- 採用したものだけ書く（線路を敷く）。代替・比較・実行順序は書かない
- 同じ観点に競合する手法を並べない
- 採用は厳守。設計検査にも使う
- より良い手法が見つかれば差し替える

## Out of Scope

コーディング規約、文章作法、運用ルール、テスト戦略、検証ループ、可観測性、改善（設計の外）。
