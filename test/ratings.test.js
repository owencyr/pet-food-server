const app = require('../src/app');
const helpers = require('./test-helpers');
const knex = require('knex');

describe('Ratings Router Endpoints', () => {
  let db;
  const {
    testUsers,
    testFoods,
    testIngredients,
    testRatings,
    testBrands,
    testSumOfRatings
  } = helpers.makePetFoodsFixtures();

  const userPostingRating = testUsers[0];

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));
  describe('GET /ratings', () => {
    beforeEach('insert Ratings', () =>
      helpers.seedPetFoodsTables(
        db,
        testBrands,
        testIngredients,
        testFoods,
        testUsers,
        testRatings
      )
    );
    context('given some ratings', () => {
      it('returns list of Sum of user ratings on a per food basis from database on GET /ratings', () => {
        const expectedSumOfRatings = testSumOfRatings;

        return supertest(app)
          .get('/api/ratings')
          .expect(200, expectedSumOfRatings);
      });
    });
  });
  describe('GET /ratings/users?userid=:userid', () => {
    context('given a user that has rated foods', () => {
      beforeEach('insert Ratings', () =>
        helpers.seedPetFoodsTables(
          db,
          testBrands,
          testIngredients,
          testFoods,
          testUsers,
          testRatings
        )
      );
      it('returns a list of foods rated by user on GET /ratings/users?userid=:userid', () => {
        const expectedResponse = testRatings.filter(
          rating => rating.userid == userPostingRating.id
        );
        supertest(app)
          .get(`api/ratings/users?userid=${userPostingRating.id}`)
          .expect(expectedResponse);
      });
    });
  });

  it('returns the new user rating on POST /ratings/foods/:foodid');
});
