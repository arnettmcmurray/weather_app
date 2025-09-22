const key = '4481a92a4074f652ccad5a84935d326d'

//https://api.openweathermap.org/data/2.5/forecast?lat=57&lon=-2.15&cnt=4&appid=4481a92a4074f652ccad5a84935d326d

//api for latitude and longitude
const removeChildren=(parent)=>{
    while (parent.firstChild){
        parent.removeChild(parent.firstChild)
    }
}

const getCoords=()=>{
    if (navigator.geolocation){
        let position = navigator.geolocation.getCurrentPosition(getWeather);
    }else{
        //get zipcode
    }
}

const getWeather = async (position)=> {
    const lat = position.coords.latitude
    const lon = position.coords.longitude
    const result = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&cnt=5&appid=4481a92a4074f652ccad5a84935d326d&units=imperial`)
    return weatherInfo(result)}


const getWeatherByZip = async (zip)=>{
    let city = document.getElementById('city')
    removeChildren(city)
    let weather = document.getElementById('forecast')
    removeChildren(weather)
    console.log(zip)
    let result = await axios.get(`http://api.openweathermap.org/geo/1.0/zip?zip=${zip}&appid=4481a92a4074f652ccad5a84935d326d&units=imperial`)
    result = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${result.data.lat}&lon=${result.data.lon}&cnt=5&appid=4481a92a4074f652ccad5a84935d326d&units=imperial`)
    console.log(result)
    return weatherInfo(result)
}    

const weatherInfo=(result)=>{
    const cityname = result.data.city.name
    const dataList = result.data.list
    const timeAdjustment = result.data.city.timezone/3600 - 3
    console.log(timeAdjustment)

    const headline = document.getElementById('city')
    const thisCity = document.createElement('h1')
    thisCity.innerText= cityname
    headline.appendChild(thisCity)

    for (data of dataList){
        let temp = data.main.temp
        temp = temp.toString().split('.')[0]
        let feel = data.main.feels_like
        feel = feel.toString().split('.')[0]
        let humidity = data.main.humidity
        let descrip = data.weather[0].description
        let timeOfDay =  data.dt_txt
        let date = timeOfDay.split(' ')[0]
        date = date.split('-')
        date = `${date[2]}/${date[1]}/${date[0]}`
        timeOfDay = parseInt(timeOfDay.split(' ')[1].split(':')[0]) + timeAdjustment
        if (timeOfDay < 0){
            timeOfDay += 24
        }
        let ampm
        if (timeOfDay >= 12){
            ampm = 'PM'
            if (timeOfDay > 12){
                timeOfDay -= 12
            }
        }else{
            ampm = 'AM'
            if (timeOfDay == 0){
                timeOfDay = 12
            }
    
        }

        let id = data.weather[0].id
        let daynight

        if (ampm == 'PM' && timeOfDay > 6){
            daynight = 'night'
        }else if (ampm == 'AM' && (timeOfDay < 6 || timeOfDay == 12)){
            daynight = 'night'
        }else{
            daynight = 'day'
        }


        console.log(timeOfDay, ampm)
        
        const forcast = document.getElementById('forecast')

        const thisCard = document.createElement('div')
        thisCard.classList.add('card')
        thisCard.style.cssText = ('width: 18rem')
        forecast.appendChild(thisCard)

        const wicon = document.createElement('div')
        wicon.classList.add('card-body', 'icon')
        thisCard.append(wicon)

        const piccy = document.createElement('i')
        piccy.classList.add('wi',`wi-owm-${daynight}-${id}`, 'wi-fw')
        wicon.appendChild(piccy)

        const showTemp = document.createElement('div')
        showTemp.classList.add('card-body')
        thisCard.appendChild(showTemp)

        const h5 = document.createElement('h5')
        h5.innerText = `${temp} F°`
        showTemp.appendChild(h5)

        const descrippy = document.createElement('div')
        descrippy.style.cssText = 'display: flex;justify-content: space-between'
        showTemp.appendChild(descrippy)

        let p = document.createElement('p')
        p.classList.add('mb-0')
        p.innerText = `${descrip}`
        descrippy.appendChild(p)

        p = document.createElement('p')
        p.classList.add('mb-0')
        p.innerText = `${timeOfDay} ${ampm}`
        descrippy.appendChild(p)

        let ul = document.createElement('ul')
        ul.classList.add('list-group', 'list-group-flush')
        thisCard.appendChild(ul)
        
        let feels = document.createElement('li') 
        feels.classList.add('list-group-item')
        feels.innerText = `Feels like: ${feel}F°`
        ul.appendChild(feels)

        let humid = document.createElement('li') 
        humid.classList.add('list-group-item')
        humid.innerText = `Humidity: ${humidity}%`
        ul.appendChild(humid)

        // let day = document.createElement('li') 
        // day.classList.add('list-group-item')
        // day.innerText = `${date}`
        // ul.appendChild(day)

        


 
    }
}

getCoords()

// result.data.city.name = cityname
// result.data.list = list of weather data in 3hr increments **loop through this list
// for weather in list
// weather.main;temp;feels_like;humidity
// weather.weather;main;description i.e. clouds; overcast clouds
// weather.dt_txt: date and time



