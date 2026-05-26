export const MOCK_DOTA_2 = {
  steamAppId: 570,
  name: 'Dota 2',
  shortDescription: 'Action RTS game by Valve.',
  headerImage: 'https://example.com/dota2.jpg',
  priceInitial: 0,
  priceFinal: 0,
  positiveReviews: 800,
  negativeReviews: 200,
  metacriticScore: 90,
  genres: ['Action', 'Strategy'],
  tags: ['MOBA', 'Multiplayer', 'Free to Play'],
}

export const MOCK_CS2 = {
  steamAppId: 730,
  name: 'Counter-Strike 2',
  shortDescription: 'Tactical shooter.',
  priceInitial: 0,
  priceFinal: 12000,
  genres: ['Action', 'Shooter'],
  headerImage: 'https://example.com/cs2.jpg',
}

export const MOCK_TEST_GAME = {
  steamAppId: '12345',
  name: 'Test Game',
  headerImage: 'test-image.jpg',
  shortDescription: 'This is a test description for the game.',
  positiveReviews: 80,
  negativeReviews: 20,
  priceFinal: 15000,
  genres: ['Action', 'RPG'],
}

export const MOCK_GAMES = [
  MOCK_DOTA_2,
  MOCK_CS2,
]
