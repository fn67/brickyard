# How to run Brickyard in one go

Folder layout (this is what you get):

```
brickyard/
  CLAUDE.md
  docs/REQUIREMENTS.md
  docs/TASKS.md
  reference/prototype.html
```

## First run
1. Put this folder somewhere safe, run `git init` in it, and open a terminal there.
2. Start Claude Code with permission prompts skipped: `claude --dangerously-skip-permissions`
   (Only do this in a folder that holds nothing else you care about. With prompts off it can run any command without asking.)
3. Paste:

> Read CLAUDE.md, then docs/REQUIREMENTS.md and docs/TASKS.md. Build the whole app by working through every stage of docs/TASKS.md in order, without stopping to ask me anything. Follow the working rules in CLAUDE.md. When everything is done, fill in the final report in docs/TASKS.md.

## If it stops or gets cut off
Start `claude` again in the same folder and paste:

> Continue. Read CLAUDE.md and docs/TASKS.md, find the first unchecked item, and carry on from there until every stage is done.

(You can also run `claude --continue` to reopen the last session, then paste the same line.)

## When it finishes
Open `docs/TASKS.md` and read the Final report and the Decisions list first, then run `npm run dev`.
