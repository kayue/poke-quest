// The player's buddy Pokémon — chosen once on the home screen and shared by
// every game mode.

export interface Hero {
  id: string
  name: string
  sprite: string // filename in /assets/pokemon
  blurb: string
}

export const HEROES: Hero[] = [
  { id: 'pikachu', name: 'Pikachu', sprite: 'pikachu.png', blurb: 'Zappy and brave!' },
  { id: 'charmander', name: 'Charmander', sprite: 'charmander.png', blurb: 'A fiery friend.' },
  { id: 'squirtle', name: 'Squirtle', sprite: 'squirtle.png', blurb: 'Cool and splashy.' },
  { id: 'bulbasaur', name: 'Bulbasaur', sprite: 'bulbasaur.png', blurb: 'Leafy and loyal.' },
  { id: 'eevee', name: 'Eevee', sprite: 'eevee.png', blurb: 'Fluffy and quick.' },
  { id: 'piplup', name: 'Piplup', sprite: 'piplup.png', blurb: 'A proud penguin.' },
]
