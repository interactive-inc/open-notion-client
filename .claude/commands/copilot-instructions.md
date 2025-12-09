---
description: 'ユーザと対話してcopilot-instructions.mdを初期化・更新する'
---

# Initialize Project Documentation

Checks and updates `.github/copilot-instructions.md` to ensure it contains all required project information. Gathers missing information through dialogue when needed.

## Core Principle

**For this command only: Codebase is the source of truth** - When running init command, documentation must match the actual codebase structure. If documentation conflicts with code, update documentation to reflect reality.

## Workflow

1. **Check Current Documentation**
   - Read `.github/copilot-instructions.md`
   - Analyze codebase structure
   - Identify missing or outdated information

2. **Verification Against Codebase**
   - Compare documentation with actual file structure
   - Check if described directories exist
   - Verify technical features match package.json/requirements
   - If documentation is outdated, update to match codebase

3. **Information Gathering**
   - If ANY required section is empty or contains placeholders:
     - Start interview process
     - Ask questions ONE at a time
     - Wait for user response before next question

4. **Update Documentation**
   - Update `.github/copilot-instructions.md` with gathered information
   - Ensure all required sections are complete
   - Maintain consistency with actual codebase

## Interview Protocol

### Initial Check Message
```
プロジェクトの設定を確認させてください。
.github/copilot-instructions.mdに必要な情報が不足しています。

まず最初の質問です：
[Ask ONE question at a time from below]
```

### Required Questions (Ask ONE at a time)

1. **Application Purpose**:
   ```
   このアプリケーションの目的を教えてください：
   - 実際の商品販売用ですか？
   - デモ・プレゼンテーション用ですか？
   - 学習・練習用ですか？
   ```

2. **System Separation**:
   ```
   システムの分離方針を教えてください：
   - フロントエンドのみのモックでよいですか？
   - バックエンドAPIとの連携予定はありますか？
   - データの永続化は必要ですか？
   ```

3. **Core Functionality**:
   ```
   コア機能の配置について教えてください：
   - 現在の構成でよいですか？
   - 他に必要な機能や特別な要件はありますか？
   ```

## Continuous Information Gathering

During development, if information is unclear:
1. STOP current task
2. Ask ONE clarifying question
3. Wait for answer
4. Continue implementation

### Trigger Conditions
- System separation requirements unclear → ASK before coding
- Core functionality placement ambiguous → ASK before creating files
- Architectural constraints missing → ASK before implementing
- Implementation direction could drift → ASK before proceeding

## Auto-Update Rules

AI automatically appends discovered constraints to `.github/copilot-instructions.md`:
- Important architectural constraints discovered through implementation
- New constraints affecting system separation
- Constraints to prevent development drift

### Update Principles
- Add constraints only when architectural direction drifts
- Remove specifications that aren't preventing problems
- Focus on maintaining system separation
- Avoid excessive documentation detail
- When codebase is truth, update documentation to match
