# ADR-0007: The wiki is authored in the repository and published to the GitHub Wiki

## Status and date

Accepted, 2026-10-19. Owner: @tyohDeveloper.

## Context

The owner asked for a project wiki. The standards keep architecture and rules in the repository so every agent reads the same source (§12). A GitHub Wiki is a separate git repository (`apple-music.wiki.git`) that exists only after its first page is created on GitHub ([GitHub Docs](https://docs.github.com/en/communities/documenting-your-project-with-wikis/adding-or-editing-wiki-pages)); pages edited there are invisible to pull requests and to agents working from a checkout.

## Decision

1. Wiki pages are written in `wiki/` in this repository and reviewed with the code. `wiki/README.md` is the home page.
2. A workflow publishes `wiki/` to the GitHub Wiki on every push to `main` that changes it, using `Andrew-Chen-Wang/github-wiki-action` pinned by commit, which moves `README.md` to `Home.md` and rewrites `.md` links into wiki links ([action documentation](https://github.com/Andrew-Chen-Wang/github-wiki-action)).
3. The wiki explains concepts and use; normative specifications stay in `docs/` and the wiki links to them, so nothing is maintained twice.
4. Edits made directly on GitHub are overwritten by the next publish; wiki editing is restricted to collaborators.

## Alternatives rejected and why

| Alternative | Why rejected |
|---|---|
| Edit the GitHub Wiki directly | Unreviewed, invisible to agents, drifts from the code it describes |
| `docs/` only | The owner asked for a wiki |
| A documentation site on GitHub Pages | More build machinery for the same content |

## Consequences

- The owner creates one placeholder page on GitHub once; the action documents this as required to create the wiki repository. The workflow also runs when a wiki page is saved on GitHub (the `gollum` event) and publishes an exact copy, so saving the placeholder publishes `wiki/` at once and later direct edits are replaced as decision 4 says.
- Wiki content is versioned and reviewed with the code it describes.
- The action also offers a pull mode that turns wiki-side edits into a pull request; it can be enabled later if editing on GitHub becomes useful.

## Evidence and approval

Owner request of 2026-10-19.

## Supersession

None.
