
  function fetchresponse1(query) {
    // console.log(querystring);
    console.log("hello");
    console.log(query);
    return fetch(
      `https://api.weatherapi.com/v1/current.json?key=812477266caa4b88a1334245241201&q=${query}`
    ).then(async (res) => {
      const data = await res.json();
      console.log(data);
      const temperature = data?.current?.temp_c;
      return temperature;
    });
  }

  module.exports = {
    fetchresponse1,
  };
  