const prettyjson = require('prettyjson');
const prettyjsonOptions = {};
const DarkSky = require('dark-sky');
const darksky = new DarkSky(process.env.DARK_SKY_KEY);
const colorType = require('../constants/colors');

module.exports = {
  /**
   * Returns a Bluebird Promise for getting the weather forecast.
   * @param {string} zipCode - A valid, 5-digit zip code for the are to get
   *    the weather for.
   * @returns {Promise} the Bluebird request-promise for this request.
   */
  getForecast: function() {
    const options = {
      latitude: 37.98329,
      longitude: -105.67369,
      exclude: ['minutely', 'daily', 'currently'],
    };
    return darksky.options(options).get();
  },

  /**
   * Returns the hue and saturation values for a given forecast and chunks (in 3 hour intervals from current time):
   *
   * Any precipitation will return values for the color Purple, regardless of
   *   temp.
   * Any forecast temperature greater than 80 degrees Fahrenheit return values
   *   for orange.
   * Any forecast temperature less than 50 degress Fahrenheit return values for
   *   blue.
   * Any other forecast temperature or conditions return values for soft white.
   *
   * @param {Object} weather - The current forecast.
   * @param {number} chunks - The number of forecast chunks to check (each chunk
   *   is 3 hours)
   * @returns {Object} The hue and saturation values. E.g., {hue: 23, saturation: 100}
   */
  getColorForForecast: function(weather, chunks) {
    console.log(`will get forecast for the next ${chunks} chunks`);

    let forecast = weather.hourly.data.slice(0, chunks * 3);
    let precip = false;
    //    console.log(prettyjson.render(forecast,prettyjsonOptions))
    let temps = forecast.map(function(item) {
      return item.temperature;
    });

    let times = forecast.map(function(item) {
      return new Date(item.time * 1000).toLocaleString('en-US');
    });

    let precips = forecast.map(function(item) {
      return item.precipProbability;
    });
    let flags = weather.flags;
    let summary = weather.hourly.summary;
    let alerts = weather.alerts;
    console.log(
      prettyjson.render(
        { summary, times, temps, precips, alerts, flags },
        prettyjsonOptions
      )
    );
    let highestTemp = Math.max(...temps);
    let lowestTemp = Math.min(...temps);

    precip = precips.some(x => x > 0.1);

    console.log(
      `precip: ${precip}, highest: ${highestTemp}, lowest: ${lowestTemp}`
    );

    let color = null;
    if (precip) {
      color = colorType.PURPLE;
    } else if (highestTemp > 40) {
      color = colorType.RED;
    } else if (lowestTemp < 10) {
      color = colorType.BLUE;
    } else {
      color = colorType.WHITE;
    }

    //console.log(`color values: ${prettyjson.render(color, prettyjsonOptions)}`);
    return color;
  },
};
