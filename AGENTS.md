# AGENTS.md

P2P tic-tac-toe rooms: a static Vite + React + TypeScript site on GitHub Pages. Two browsers talk over PeerJS (WebRTC), and there is no backend. The spec is [#6](https://github.com/lucasmelz-mindera/demo-sdd-AI-in-SDLC/issues/6). Read it before you change behaviour.

## Commands
npm ci                     # install (Node >= 22.12)
npm run dev                # dev server at http://localhost:5173/demo-sdd-AI-in-SDLC/
npm test -- --run          # all tests, once
npm run lint -- --fix
npm run build              # tsc -b && vite build -> dist/
npm run preview            # serve dist/ at the Pages sub-path

## Project
Game rules (pure):   src/games/      types.ts, registry.ts, tictactoe.ts (+ .test.ts)
Networking (PeerJS): src/net/        protocol.ts, roomId.ts, host.ts, guest.ts
Profile storage:     src/profile/    localStorage, one key
Hash routing:        src/routing/    useHashRoute, shareUrl
UI (React):          src/ui/         pages, forms, board components, *.module.css
Deploy:              .github/workflows/deploy.yml

## Conventions
- A new game is one `GameDefinition` in `src/games/<id>.ts`, registered in `src/games/registry.ts`, plus a board component in `src/ui/games/`. Follow `src/games/tictactoe.ts`. Do not change `net/` to add a game.
- `src/games/` is pure: no React, PeerJS, DOM or `localStorage` imports. Functions return new state and never mutate.
- Game state and every network message must be plain JSON (no classes, Maps, Dates or functions).
- The host is authoritative. The guest only sends `move` intents; the host validates with `isValidMove`, applies, and broadcasts full `state`. Never apply a move on the guest.
- Messages are the `Message` union in `src/net/protocol.ts`. Add a variant there and to `isMessage` before you send it.
- UI renders from the room snapshot plus the game definition only. Game logic does not live in components.
- Styling uses CSS modules (`Component.module.css`). No global styles beyond `index.css` resets.
- Routes are hash-based (`#/`, `#/room/<id>`) through `useHashRoute`. Build share links with `shareUrl(id)`, never a hard-coded host or base path.
- Write rules tests first (Vitest) through the `GameDefinition` interface. `net/` and `ui/` are checked by hand in two browser tabs. Say in the PR which scenarios you ran.

## Boundaries
ALWAYS     run `npm test -- --run`, `npm run lint` and `npm run build` before you finish
ALWAYS     keep `src/games/` free of side effects and covered by tests
ASK FIRST  new dependencies (the allowed set is React, PeerJS, Vite tooling and Vitest)
ASK FIRST  changing the message protocol, the `GameDefinition` interface, or `base` in vite.config.ts
ASK FIRST  editing .github/workflows/ or GitHub Pages settings
NEVER      add a backend, custom PeerServer, or TURN server
NEVER      add a router, state-management, game or UI-kit library
NEVER      commit secrets or `.env*` files; edit `dist/` or `node_modules/`
