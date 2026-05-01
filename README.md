# Knowem

Knowem is a realtime social party game scaffold built with Vue 3, Vite, TypeScript, TailwindCSS, Pinia, VueUse Motion, Express, and Socket.io.

## Stack

- Frontend: Vue 3 + Vite + TypeScript
- Styling: TailwindCSS
- Motion: @vueuse/motion
- Icons-ready UI scaffold: lucide-vue-next
- State: Pinia
- Backend: Node.js + Express + Socket.io
- Shared contracts: TypeScript types in `shared/`

## Features Included

- Username-only temporary session identity stored in local storage
- Room create/join flow with room code and optional password
- Lobby with connected players, ready state, host start control, and invite link
- Realtime game table with phases:
	- waiting
	- question reveal
	- answer phase
	- judging phase
	- results
- Hidden role cards:
	- Truth
	- False
	- Forced Truth
	- Counter
- Adjudicator rotation, score tracking, round recap modal, and chat with optional DMs
- Shared frontend/backend game types for room and player state

## Scripts

- `npm install`
- `npm run dev` to start Vite and the Socket.io server together
- `npm run build` to run Vue typecheck, frontend build, and server TypeScript build
- `npm run start` to run the compiled backend from `dist-server/`

## Project Layout

```text
.
├─ server/            # Express + Socket.io server and room/game engine
├─ shared/            # Shared TypeScript contracts
├─ src/
│  ├─ assets/         # Mock question dataset
│  ├─ components/     # Lobby, table, cards, modals, chat, scoreboard
│  ├─ services/       # Socket client
│  ├─ stores/         # Pinia session and game state
│  ├─ types/          # Frontend re-exports for shared contracts
│  └─ views/          # Home and room screens
└─ README.md
```

## Socket Events

Inbound and outbound room flow is centered around:

- `join_room`
- `leave_room`
- `start_game`
- `deal_cards`
- `submit_answer`
- `adjudicator_vote`
- `next_round`

Additional sync events:

- `room_state`
- `private_state`
- `chat_message`
- `room_error`

## Notes

- Voice rooms are not implemented in this scaffold yet.
- Counter cards are represented in state and UI, with room for extending full wild-card negation rules.
- Turn timers are displayed from server timestamps, but phase expiry is still host-driven rather than automatic.