const app = require("../server");
const {getStreetsInAlternative,
    getBestAlternative,
    getTotalWeightInAlternative,
    getDirections
} = require("../Controllers/directionsContorller");
const { getFieldScoreForStreets } = require("../Controllers/mongoStreetsController");
const e = require("express");
jest.mock('axios');
jest.mock('../Controllers/mongoStreetsController');
beforeAll((done) => {
  done();
});

afterAll((done)=>{
    done()
})


describe('getStreetsInAlternative', () => {
  it('should return an array of streets', async () => {
    const index = 0;
    const origin = 'Seattle, WA';
    const destination = 'Bellevue, WA';
    const preference = 'safety';
    const expectedStreets = ['Main St', 'Elm St'];

    axios.get.mockResolvedValue({
      data: {
        routes: [
          {
            legs: [
              {
                steps: [
                  {
                    html_instructions: 'Turn <b>left</b> onto Main St'
                  },
                  {
                    html_instructions: 'Turn <b>right</b> onto Elm St'
                  }
                ]
              }
            ]
          }
        ]
      }
    });

    const streets = await getStreetsInAlternative(index, origin, destination, preference);
    expect(streets).toEqual(expectedStreets);
  });
});

describe('getBestAlternative', () => {
  it('should return the index of the best alternative', async () => {
    const routes = [
      {
        legs: [
          {
            steps: []
          }
        ]
      },
      {
        legs: [
          {
            steps: []
          }
        ]
      }
    ];
    const origin = 'Seattle, WA';
    const destination = 'Bellevue, WA';
    const preference = 'safety';
    const expectedIndex = 1;

    const index = await getBestAlternative(routes, origin, destination, preference);
    expect(index).toEqual(expectedIndex);
  });
});
describe('getTotalWeightInAlternative', () => {
  it('should return the total weight for the given streets', async () => {
    const streets = ['Main St', 'Elm St'];
    const preference = 'safety';
    const expectedWeight = 10;

    getFieldScoreForStreets.mockResolvedValue(expectedWeight);

    const weight = await getTotalWeightInAlternative(streets, preference);
    expect(weight).toEqual(expectedWeight);
  });
});
