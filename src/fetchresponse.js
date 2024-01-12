// function fetchresponse(lat,lon) {
//   console.log("hello");
//     return fetch(
//       `https://api.weatherapi.com/v1/current.json?key=812477266caa4b88a1334245241201&q=${lat},${lon}`
//       // `https://api.coingecko.com/api/v3/simple/price?ids=aeternity&vs_currencies=${queryString}`,
//     ).then(async (res) => {

//       (await res.json()).aeternity[lat,lon]}
    
//     );
//   }
  
  // module.exports = {
  //   fetchresponse,
  // };

  // fetchresponse(51.52,-0.11)
  

  function fetchresponse1(lat, lon) {
    console.log("hello");
    return fetch(
      `https://api.weatherapi.com/v1/current.json?key=812477266caa4b88a1334245241201&q=${lat},${lon}`
    ).then(async (res) => {
      const data = await res.json();
      console.log(data);
      // Extract the temperature or other relevant information based on the API response structure
      const temperature = data?.current?.temp_c;
      return temperature;
    });
  }

  module.exports = {
    fetchresponse1,
  };
  
 
  // fetchresponse(51.52, -0.11)
  //   .then((temperature) => {
  //     console.log(`Temperature: ${temperature}°C`);
  //   })
  //   .catch((error) => {
  //     console.error("Error fetching temperature:", error);
  //   });