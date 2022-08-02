const dayNight = document.querySelector('#dayNight');

const locationName = document.querySelector('#location');
const timeText = document.querySelector('#time');

const mainIcon = document.querySelector('#mainIcon');
const tempText = document.querySelector('#temperature');
const WeatherInfoText = document.querySelector('#WeatherInfo');

const windText = document.querySelector('#wind');
const humidityText = document.querySelector('#humidity');

// 시계 구현
function clock(){
  const now = new Date();
  
  const day = now.getDay();
  const week = ['일', '월', '화', '수', '목', '금', '토'];
  let hours = now.getHours();
  const minutes = now.getMinutes();

  let ampm =  '';
  if(hours > 12){
    hours -= 12;
    ampm = '오후';
  }else ampm = '오전';

  // 예시 : 화, 오후 12:36
  timeText.innerText = `${week[day]}, ${ampm} ${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}`

  // 현재시간 초로
  let nowSecTime = now.getHours()*3600 + now.getMinutes()*60 + now.getSeconds();
  return nowSecTime
}

// // 1초마다 시간 실행
(() => {
  clock();
  setInterval(clock, 1000);
})();


// 위도, 경도
navigator.geolocation.getCurrentPosition((position) => {
  const lat = position.coords.latitude; // 위도
  const lon = position.coords.longitude; // 경도
  showWeather(lat, lon)
});

// 날씨 데이터 가져오기
async function weatherData(lat, lon){
  const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=317eb535e8ab6157652cc6cfc8ae8500`);
  const data = await res.json();

  return data;
}

// 필요한 날씨 데이터 사용
async function showWeather(lat, lon){
  const data = await weatherData(lat, lon);
  console.log(data);

  const temp = data.main.temp // 온도
  const cityName = data.name; // 도시 이름
  const weather = data.weather[0].main // 날씨
  const icon = data.weather[0].icon // 날씨 아이콘
  const windSppeed = data.wind.speed; // 풍속
  const humidity = data.main.humidity; // 습도
  const sunrise = data.sys.sunrise; // 일출시간
  const sunset = data.sys.sunset; // 일몰시간

  locationName.innerText = `${cityName}`
  
  tempText.innerText = `${Math.floor(temp - 273.15)}°`
  WeatherInfoText.innerText = `${weather}`

  windText.innerText = `${Math.floor(windSppeed)}m / s`
  humidityText.innerText = `${humidity}%`

  const sunTime = unixChange(sunrise, sunset);
  const dayAndNight = dayNightChange(sunTime['sunrise'], sunTime['sunset'], clock());
  
  skyconWeather(icon, dayAndNight);
}

// 유닉스시간 일반시간으로 변경 -> 초시간으로 변경
function unixChange(sunrise, sunset){
  const sunriseDate = new Date(sunrise*1000);
  const sunsetDate = new Date(sunset*1000);

  // 일반시간 시, 분, 초를 다 합산하여 초로 만들기
  const sunriseSec = sunriseDate.getHours()*3600 + sunriseDate.getMinutes()*60 + sunriseDate.getSeconds();
  const sunsetSec = sunsetDate.getHours()*3600 + sunsetDate.getMinutes()*60 + sunsetDate.getSeconds();

  return {'sunrise': sunriseSec, 'sunset': sunsetSec}
}

// 낮, 밤 구현하기
function dayNightChange(sunrise, sunset, now){
  if(now >= sunrise && now < sunset){
    dayNight.classList.remove('night');
    dayNight.classList.add('day');
    return 1;
  }else{
    dayNight.classList.remove('day');
    dayNight.classList.add('night');
    return 0;
  }
}

// 날씨데이터에 따라 skycon적용
function skyconWeather(icon, dayAndNight){
  const iconNum = icon.slice(0, -1);
  const weatherData = {
    '01' : ['clear-day', 'clear-night'],
    '02' : ['partly-cloudy-day', 'partly-cloudy-night'],
    '03' : 'cloudy',
    '04' : 'cloudy',
    '09' : 'rain',
    '10' : 'rain',
    '13' : 'snow',
    '50' : 'fog',
  }

  let skyconName = '';
  if(iconNum === '01' || iconNum === '02'){
    skyconName = dayAndNight ? weatherData[iconNum][0] : weatherData[iconNum][1];
  }else{
    skyconName = weatherData[iconNum];
  }

  let icons = new Skycons({'color': dayAndNight ? '#2B323C' : '#DBE2EA'});
  icons.set(mainIcon, skyconName);
  icons.play();
}