# API Design

## RESTful URL

- リソース指向。URL は名詞のみ、動詞は HTTP メソッドで表す
- メソッド: `GET`（取得）/ `POST`（作成）/ `PUT`（全置換）/ `PATCH`（部分更新）/ `DELETE`（削除）
- リソース名は複数形。`/users`、`/users/:id`、`/users/:id/orders`
- 操作を URL に入れない。`/getUser`、`/users/create`、`/users/:id/delete` は不可
- 階層は所有関係のみ。`/users/:id/orders` は user が order を所有する場合
- フィルタ・並び替え・ページングは query string。`/users?role=admin&sort=-created_at&page=2`

## Naming

- 複数形にできないリソース名は使わない（`info`、`metadata`、`data` など）
- DB のテーブル名と URL のリソース名は揃える
- 粒度が曖昧な名前が出てきたら分解して具体的な複数形にする
