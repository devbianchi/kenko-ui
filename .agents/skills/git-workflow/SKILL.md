---
name: git-workflow
description: Create task branches, commit reviewed work in logical commits, push branches, and merge them into main keeping branch history. Use only when the user asks to branch, commit, push or merge.
---

# Git workflow

Use this only when the user's request says to branch, commit, push or merge. Do each step only if it was requested. Shell is Windows PowerShell: chain commands with `;`.

## 1. Branch

- Name: `<type>/<short-topic>`, with type one of `feat`, `fix`, `refactor`, `test`, `chore`, `docs` (example: `feat/money-numeric`).
- Start from an up-to-date main: `git switch main; git pull --ff-only; git switch -c <name>`.
- If uncommitted changes already exist on main, `git switch -c <name>` carries them to the new branch. Check `git status` first and report anything unrelated to the task.
- Never commit on `main` or `master`. If you are on one, create a branch first.

## 2. Commit

Preconditions: the user asked for the commit. If a review exists and its verdict is "do not approve", say so and ask before committing.

1. `git status`. Identify files that belong to the reviewed change. Leave unrelated changes alone.
2. Stage explicit paths: `git add <path> <path>`. Never `git add -A` or `git add .`.
3. `git diff --cached --stat` must match the reviewed change. If it does not, unstage the extra files.
4. One logical scope per commit (for example fix, tests, migration as separate commits when they stand alone). Message: `type(scope): summary`, imperative, under 72 characters, with a short body only when the why is not obvious.
5. Add the co-author trailer. Copy it from a previous commit (`git log -5`); if none has one, ask.
6. `git show --stat HEAD` after each commit.

`.agents/plans` is git-ignored. Never use `git add -f` on it unless asked. Everything else under `.agents/` is not ignored and can be committed like any other change.

## 3. Push a branch

Only when asked: `git push -u origin <branch>`. Never force-push. Never push `main` in this step.

## 4. Merge into main

Only when asked, with the branch pushed and the full suite green on it (the reviewer's run counts if nothing changed since).

```
git switch main; git pull --ff-only; git merge --no-ff <branch> -m "Merge <branch>: <summary>"
```

- `--no-ff` always creates a merge commit, so the branch stays visible in the history and in GitHub's graph as a unit.
- Push `main` only if the user asked: `git push`.
- Keep the branch, local and remote. Do not delete it.
- On a merge conflict: stop, run `git merge --abort`, and report the conflicting files.

## 5. Report

```
Branch: <name> (created / existing)
Commits: <hash> <message> (one per line)
Pushed: <branch / main / no>
Merged: <yes (merge commit hash) / no>
Tree: <clean / remaining unrelated changes: ...>
```

Add `git log --oneline --graph -10` when a merge happened.

## 6. Never

- Never `git add -A`, `--amend` a pushed commit, `reset --hard`, `--force`, or `--no-verify`.
- Never rebase or rewrite commits that are already pushed.
- Never delete branches.
- Never commit, push or merge without being asked.
- Never open pull requests.
