const formJs = document.querySelectorAll("form")[0];
//! Jquery === $
// const formJquery = jQuery("form")[0];
// const formJquery = jQuery("form").get(0);
// const formJquery = jQuery("form").eq(0);
//! get(index) ==> toArray(get()) , eq(index)
const formJquery = $("form").eq(0);
const inputJQ = $(".top-banner input").eq(0);
const msgJQ = $(".top-banner span").eq(0);
const listJQ = $(".cities").eq(0);
const langList = document.querySelector("#weight-unit");
const langListOption = document.querySelector("#weight-unit option");

//! load VS DOMContentLoaded
//! DOMContentLoaded ==> means page rendered, DOM is ready
//! window load ==> (all content (e.g. images, styles etc) also loaded)

//? Js useage : window.onload = () => {};
//? or window.addEventListener('load', () => {});

$(window).on("load", () => {
  console.log("window.load");
  getLanguageDataFromApi();
});

//? Js useage : document.addEventListener('DOMContentLoaded', () => {});
// $(document).on("DOMContentLoaded", () => {
//   console.log("DOMContentLoaded");
// }); ! not commonly use

$(document).ready(() => {
  console.log("DOMContentLoaded");
  localStorage.setItem(
    "tokenKey",
    "SHoxu5GROKvCyQInTdcOZeX0FmFehr0dm55kBcT8WeO5o5SfoGkDEN4gYpvbTKZu"
  ); //! encrypted token
  // localStorage.setItem(
  //   "tokenKeyEncrypted",
  //   EncryptStringAES("bdc0a9d3300e48e270c3b01f5ccac115")
  // );
});

//! form submit and get Api Info
// formJquery.on("submit", (e) => {
//   e.preventDefault();
//   getWeatherDataFromApi();
// });

formJquery.submit((e) => {
  e.preventDefault();
  getWeatherDataFromApi();
});

//todo Rest Api has no langCode, so do it here when added

// langList.onchange = () => {
//   localStorage.setItem("lang", `${langList.value}`);
// };

//todo   //! Get Rest Api function (Lang Code)--Axios

// const getLanguageCodeDataFromApi = async () => {
//   let lang = localStorage.getItem("lang");
//   const url = `https://restcountries.com/v3.1/lang/${lang}`;

//   try {
//     const res = await axios(url);
//     const langCode = res.data[0];
//     console.log(langCode);
//   } catch (err) {
//     console.log(err);
//   }
// };

// ! Language Choice
localStorage.setItem("lang", "tr");
langList.onchange = () => {
  localStorage.setItem("lang", `${langList.value}`);
};

//! Get Rest Api function --Fetch async-await
const getLanguageDataFromApi = async () => {
  const url = `https://restcountries.com/v3.1/all`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      renderError(res);
    }

    const data = await res.json();
    return renderLanguages(data);
  } catch (err) {
    console.log(err);
  }
};

//!  Rendering Language
const renderLanguages = (data) => {
  const select = document.querySelector("#weight-unit");

  let countryLangArr = [];

  // select data and filtered
  const countryLangNestedArr = data
    .map((data) => data.languages)
    .filter((data) => {
      if (data == null || data == undefined) {
        return false;
      } else {
        return true;
      }
    })
    .map((data) => Object.values(data));

  countryLangNestedArr.forEach((arr) =>
    arr.forEach((element) => {
      if (!countryLangArr.includes(element)) {
        countryLangArr.push(element);
      }
    })
  );

  // press Dom
  countryLangArr.sort().forEach((lang) => {
    !(lang === "English" || lang === "Turkish") &&
      (select.innerHTML += `
<option>${lang}</option>
`);
  });
};

//! Get Weather Api function
const getWeatherDataFromApi = async () => {
  const apiKey = DecryptStringAES(localStorage.getItem("tokenKey"));
  const cityName = inputJQ.val();
  const units = "metric";
  let lang = localStorage.getItem("lang");
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=${units}&lang=${lang}`;

  // ! XMLHTTPREQUEST vs. fetch() vs. axios vs. $.ajax

  $.ajax({
    type: "GET",
    url: url,
    dataType: "json",
    success: (response) => {
      console.log(response);
      // main body func.
      const { main, sys, name, weather } = response;
      const iconUrlAWS = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${weather[0].icon}.svg`;
      //alternative iconUrl
      const iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

      //? JS => document.createElement("li")
      //? $(document.createElement("li"))

      //! Weather card control!!(querySelector => find(Jquery))

      const cityCardList = listJQ.find(".city");
      const cityCardListArray = cityCardList.get();

      if (cityCardListArray.length > 0) {
        const filteredArray = cityCardListArray.filter(
          (li) => $(li).find("span").text() == name
        );

        if (filteredArray.length > 0) {
          msgJQ.text(
            `You already know the weather for ${name}, Please search for another city`
          );
          //? styling
          msgJQ.css({
            color: "var(--red)",
            "text-decoration": "underline",
            "font-weight": "bold",
          });

          setTimeout(() => {
            msgJQ.text(``);
          }, 3000);

          formJquery.trigger("reset");
          return;
        }
      }

      const createdLi = $("<li></li>");
      createdLi.addClass("city");
      createdLi.html(`
      <h2 class="city-name" data-name="${name}, ${sys.country}">
          <span>${name}</span>
          <sup>${sys.country}</sup>
      </h2>
      <div class="city-temp">${Math.round(main.temp)}<sup>°C</sup></div>
      <figure>
          <img class="city-icon" src="${iconUrl}">
          <figcaption>${weather[0].description}</figcaption>
      </figure>`);

      //append vs. prepend both in JS and JQUERY
      listJQ.prepend(createdLi);

      //? Jquery Samples

      $(".city img").click((e) => {
        // getAttribute, setAttribute ==> attr
        // window.location.href = $(e.target).attr("src");
        $(e.target).attr("src", iconUrlAWS);
        $(e.target).slideUp(1000).slideDown(2000);
      });

      // $(".city img").click((e) => {
      //   //? hide() vs show()
      //   $(e.target.parentElement).find("img").hide(1000);
      //   $(e.target.parentElement).find("img").show(2000);
      // });

      //? JS => formJs.reset();
      formJquery.trigger("reset");
    },
    beforeSend: (request) => {
      console.log("before ajax send");
      // Encryption
      // request.header("..", "..")/body
      // token
    },
    complete: () => {
      console.log("after ajax send");
    },
    error: (XMLHttpRequest) => {
      // console.log(XMLHttpRequest);
      //logging
      // postErrorLog(p1, p2, p3, p4);
      // console.log(HXMLHttpRequest)
      msgJQ.text(
        `${XMLHttpRequest.responseJSON.message}...(${XMLHttpRequest.status} ${XMLHttpRequest.statusText})`
      );
      //? styling
      msgJQ.css({
        color: "var(--red)",
        "text-decoration": "underline",
        "font-weight": "bold",
      });
      setTimeout(() => {
        msgJQ.text("");
      }, 3000);
      formJquery.trigger("reset");
    },
  });
};

// ! Eror Handling

const renderError = (err) => {
  console.log(err);
  msgJQ.text(`${err.status} ${err.statusText} `);
  //? styling
  msgJQ.css({
    color: "var(--red)",
    "text-decoration": "underline",
    "font-weight": "bold",
  });
};
