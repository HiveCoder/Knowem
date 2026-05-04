## React + Tailwind reference

This folder mirrors the current card interaction model from the Vue app as a standalone React reference.

It is intentionally not wired into the Vite build or router.

Included pieces:

- `Card.tsx`: interactive flip-capable card primitive
- `PlayerHand.tsx`: local hand flip state and selection behavior
- `GameTable.tsx`: table layout with center-play card rail
- `useCardPlaySync.ts`: socket event hook for `cardPlayed`
- `types.ts`: lightweight shared view-model types for the reference components

The prop model matches the shipped Vue interaction pass closely:

- `isFlipped`
- `isWild`
- `isPlayed`
- `playAnimationKey`
- `cardType: 'primary' | 'wild'`

The reference assumes a React app with Tailwind CSS and `socket.io-client` available.