/******* header-component start************/
Vue.component('header-component', {
  template: `<header v-if="msg">
                  <sidebar-btn></sidebar-btn>
                  <div class="header-text">
                    <header-title :name="msg.name"></header-title>
                    <today-weather v-if="weathers" :msg="msg"></today-weather>
                    <ball-component :msg="msg"></ball-component>
                  </div>
                </header>`,
  data() {
    return {
      msg: null,
      weathers: null,
      city: 'london'
    }
  },
  created() {
    this.getData();
  },
  mounted() {
    var that = this;
    bus.$on('changeCities', function(value, index) {
      that.city = value.name;
    });
  },
  watch: {
    city() {
      this.getData();
    }
  },
  methods: {
    getData() {
      // 获取当天的天气数据
      var that = this;
      axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${this.city}&appid=a2ab57852e62ebf5fcf33092efa47ce7`)
        .then(function(response) {
          that.msg = response.data;
          that.weathers = response.data.weather;
        })
        .catch(function(error) {
          console.error(error);
        })
    }
  }
})
Vue.component('sidebar-btn', {
  template: `<div @click="active" class="sidebar-btn">
                  <i class="box-shadow iconfont" :class="{['icon-category']:!show,['icon-u-arrow3-left']:show}"></i>
                </div>`,
  data() {
    return {
      show: false
    }
  },
  mounted() {
    var that = this;
    bus.$on('slippery', function(value) {
      that.show = value;
    })
  },
  methods: {
    active() {
      this.show = !this.show;
      bus.$emit('slippery', this.show);
    }
  }
})
Vue.component('header-title', {
  template: `<div class="title">
    <h2 class="city">{{name}}</h2>
    <div class="title-right">
      <span>{{times}}</span>
    </div>
  </div>`,
  props: ['name'],
  data() {
    return {
      times:''
    }
  },
  created() {
    var that = this;
    setInterval(function() {
      that.now();
    },1000)
  },
  methods: {
    now: function() {
      var date = new Date();
      var hours = date.getHours() < 10 ? `0${date.getHours()}`: date.getHours();
      var minu = date.getMinutes()< 10 ? `0${date.getMinutes()}`: date.getMinutes();
      this.times = hours + ':' + minu;
    }
  }
})
Vue.component('today-weather', {
  template: `<div class="today-weather">
    <div class="temp img-box">
      <img v-for="(weather, index) in msg.weather"
      :src="'https://openweathermap.org/img/w/' + weather.icon + '.png'"
      alt="天气图标"/>
    </div>
    <div class="temp temperature-box">
      <div class="temperature">{{temp}}</div>
      <div class="description">
        <span v-for="(weather, index) in msg.weather">{{weather.description}}</span>
      </div>
    </div>
  </div>`,
  props: ["msg"],
  computed: {
    temp() {
      return /\d+\.?\d{0,2}/.exec(this.msg.main.temp - 273.15) + '℃';
    }
  }
})
Vue.component('ball-component', {
  template: `<div class="temp-ball" v-if="msg">
    <div class="ball humidity">
      <span>{{msg.main.humidity}}%</span>
      <i class="icon iconfont icon-shuidi"></i>
    </div>
    <div class="ball speed">
      <span>{{msg.wind.speed}}</span>
      <i class="icon icon-feng iconfont"></i>
    </div>
    <div class="ball all">
      <span>{{msg.clouds.all}}%</span>
      <i class="icon icon-yun iconfont"></i>
    </div>
    <div class="ball pressure">
      <span>{{msg.main.pressure}}</span>
      <i class="icon icon-daqiyali iconfont"></i>
    </div>
    <div @click="toggleClock" class="ball clock box-shadow">
      <i class="iconfont" :class="{['icon-data']:!show,['icon-shizhong1']:show}"></i>
    </div>
  </div>`,
  data() {
    return {
      show: true
    }
  },
  props: ['msg'],
  methods: {
    toggleClock() {
      this.show = !this.show;
      bus.$emit('toggle-clock', this.show);
    }
  }
})
/******** header-component end*************/

/********sidebar-component start**************/
Vue.component('sidebar-component', {
  template: `<aside :class="{show:show, zIndex:zIndex}">
    <bg-aside></bg-aside>
    <citys></citys>
    <add-btn></add-btn>
    <add-citys></add-citys>
  </aside>`,
  data() {
    return {
      show: '',
      zIndex: false
    }
  },
  mounted() {
    var that = this;
    bus.$on('slippery', function(value) {
      that.show = value;
    })
    bus.$on('zIndex', function(value) {
      that.zIndex = value;
    })
  }
})
Vue.component('bg-aside', {
  template: `<div class="bg-aside"></div>`
})
Vue.component('citys', {
  template: `<div class="citys">
      <ul>
        <li
          v-for="(city, index) in arr"
          @click="changeCity(city)"
          :class="{active:city.status===status}">
          <i class="iconfont icon-temp"></i>
          <span class="city-name">{{city.name}}</span>
        </li>
      </ul>
    </div>`,
  data() {
    return {
      arr:[{name:'london', status:true}],  //status查看当前城市有没有被选中
      status:true
    }
  },
  mounted() {
    var that = this;
    bus.$on('getCityArr', function(arr) {
      console.log(arr, that.arr);
      that.arr = arr;
    })
  },
  methods: {
    // 切换城市
    changeCity(city) {
      console.log('xxxx this:', this);

      this.arr = this.arr.map(item => {
        item.status = item.name === city.name;
        return item;
      });

      // this.arr.push({name: 'xxxx', status: 'gun'});

      bus.$emit('changeCities', city);
    },
    // fetch() {
    //   var arrCity = JSON.parse(localStorage.getItem('citys'));
    //   return arrCity
    // }
  }
})
Vue.component('add-btn', {
  template: `<div class="add-btn" @click="active">
      <i class="icon-add"></i>
      <span>Add/Delete Location</span>
    </div>`,
  methods: {
    active() {
      bus.$emit('toggleTransform', false);
      bus.$emit('zIndex', true);
    }
  }
})
Vue.component('add-citys', {
  template: `<div class="add-citys" :class="{active:transform}">
    <div class="search">
      <input
        v-model="cityName"
        type="text"
        placeholder="Please enter the city name"
        @keyup.enter="keyup" />
    </div>
    <div class="city-list">
      <ul>
        <li v-for="(city,index) in cityArr" :class="{active:city.status}">
          <h4 class="city-name">{{city.name}}</h4>
          <div class="delete" @click="deleteCity(city,index)">
            <i class="iconfont icon-delete1"></i>
          </div>
        </li>
      </ul>
    </div>
    <div class="returnPrev" @click="active">
      <i class="iconfont icon-arrow-up"></i>
    </div>
  </div>`,
  data() {
    return {
      cityName: '',
      cityArr:[{name:'london', status:true}],
      transform: true
    }
  },
  watch: {
    cityArr() {
      // debugger;
    //   this.save(this.cityArr);
    }
  },
  methods: {
    keyup() {
      if (this.cityName === '') {
        return;
      }

      this.cityArr.push({
        name: this.cityName.trim(),
        status: false
      });

      console.log('this.cityArr:', this);

      // getCityArr添加城市
      // 遇到的问题，获取数据时获取不到真正的数组而是被getter函数处理过的所以用JSON.parse(JSON.stringify())处理一下
      bus.$emit('getCityArr', JSON.parse(JSON.stringify(this.cityArr)));
      this.cityName = '';
    },
    active() {
      this.transform = true;
      bus.$emit('zIndex', false);
    },
    deleteCity(city, index) {
      if(this.cityArr.length === 1) {
        return;
      }
      var i = this.cityArr.indexOf(city);
      this.cityArr.splice(i, 1);
      if (index === this.i) {
        this.i = 0;
      }
      if(index < this.i) {
        this.i--;
      }
      bus.$emit('getCityArr', [...this.cityArr], this.i);
    },
    // fetch() {
    //   var arrCity = JSON.parse(localStorage.getItem('city'));
    //   return arrCity
    // },
    // save(citys) {
    //   localStorage.setItem('city',JSON.stringify(citys));
    // }
  },
  mounted() {
    // console.log('this::', this)
    var that = this;
    bus.$on('toggleTransform', function(value) {
      that.transform = value;
    });

    bus.$on('changeCities', function(value, index) {

    });
  }
})
/********sidebar-component end *************/

/********main-component end *************/
Vue.component('main-component', {
  template: `<main>
    <fiveday-component></fiveday-component>
    <moreday-component></moreday-component>
  </main>`
})
Vue.component('fiveday-component', {
  template: `<div class="fiveday" :class="{display:show}">
      <ul>
        <li v-for="day in fiveDay">
          <h3 class="box-shadow">
            <span class="week">{{days(day[0].dt)}}</span>
            <span class="date">{{date(day[0].dt)}}</span>
          </h3>
          <ul class="three-hours">
            <li v-for="hour in day">
              <div class="left-temp">
                <img :src="'https://openweathermap.org/img/w/'+ hour.weather[0].icon +'.png'"/>
                <div class="temp">
                  <h4 class="desc">{{hour.weather[0].description}}</h4>
                  <span class="temp-hight">{{temp(hour.main.temp_max)}}-</span>
                  <span class="temp-low">{{temp(hour.main.temp_min)}}</span>
                </div>
              </div>
              <div class="right-time">
                <span class="week">{{days(hour.dt)}}</span>
                <span class="hour">{{hours(hour.dt)}}</span>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>`,
  data() {
    return {
      show: true,
      fiveDay: [],
      arr: [],
      city: 'london'
    }
  },
  created() {
    this.getData();
  },
  mounted() {
    var that = this;
    bus.$on('toggle-clock', function(value) {
      that.show = value;
    });
    bus.$on('changeCities', function(value, index) {
      that.city = value.name;
    });
  },
  watch: {
    city() {
      this.getData();
    }
  },
  methods: {
    test: function(arr) {
      this.fiveDay = [];
      var arr2 = [];
      for (var i = 0; i < arr.length - 1; i++) {
        var curr = new Date(arr[i].dt * 1000).getDate();
        var next = new Date(arr[i + 1].dt * 1000).getDate();
        this.arr.push(curr)
        arr2.push(arr[i]);
        if (curr !== next) {
          this.fiveDay.push(arr2);
          arr2 = [];
        }
        if (i === arr.length - 2) {
          arr2.push(arr[i + 1]);
          this.fiveDay.push(arr2);
          arr2 = [];
        }
      }
    },
    getData() {
      // 获取5天3小时的天气数据
      var that = this;
      axios.get(`http://api.openweathermap.org/data/2.5/forecast?q=${this.city}&appid=a2ab57852e62ebf5fcf33092efa47ce7`)
        .then(function(response) {
          that.test(response.data.list);
        })
        .catch(function(error) {
          console.error(error);
        })
    },
    days(dt) {
      var day = new Date(dt * 1000);
      var str = String(day).substr(0, 3);
      return str;
    },
    date(dt) {
      var day = new Date(dt * 1000);
      var str = String(day).substr(4, 3) + ' ' + String(day).substr(8, 3);
      return str;
    },
    temp(temp) {
      return /\d+\.?\d{0,2}/.exec(temp - 273.15) + '℃';
    },
    hours: function(dt) {
      var date = new Date(dt * 1000);
      var hour = date.getHours();
      var minute = date.getMinutes();
      if (hour < 12) {
        return hour + ':' + minute + '0 AM';
      } else {
        return hour + ':' + minute + '0 PM';
      }
    }
  }
})
Vue.component('moreday-component', {
  template: `<div class="moreday" :class="{display:show}">
    <ul>
      <li v-for="value in list">
        <div class="left-temp">
          <img :src="'https://openweathermap.org/img/w/'+ value.weather[0].icon +'.png'"/>
          <div class="temp">
            <h4 class="desc">{{value.weather[0].description}}</h4>
            <span class="temp-hight">{{value.temp.max}}℃-</span>
            <span class="temp-low">{{value.temp.min}}℃</span>
          </div>
        </div>
        <div class="right-time">
          <span class="week">{{days(value.dt)}}</span>
          <span class="hour">{{date(value.dt)}}</span>
        </div>
      </li>
    </ul>
  </div>`,
  data() {
    return {
      show: false,
      list: [],
      city: 'london'
    }
  },
  created() {
    this.getData();
  },
  watch: {
    city() {
      this.getData();
    }
  },
  mounted() {
    var that = this;
    bus.$on('toggle-clock', function(value) {
      that.show = !value;
    });
    bus.$on('changeCities', function(value, index) {
      that.city = value.name;
    });
  },
  methods: {
    getData() {
      var that = this;
      axios.get(`https://api.openweathermap.org/data/2.5/forecast/daily?q=${this.city}&appid=6b5537cd39eac5d2b02dce11bd27a9e4&units=metric&cnt=16`)
        .then(function(response) {
          that.list = response.data.list;
        })
        .catch(function(error) {
          console.error(error);
        })
    },
    days(dt) {
      var day = new Date(dt * 1000);
      var str = String(day).substr(0, 3);
      return str;
    },
    date(dt) {
      var day = new Date(dt * 1000);
      var str = String(day).substr(4, 3) + ' ' + String(day).substr(8, 3);
      return str;
    }
  }
})
/********main-component end *************/

/*************dark-component start*************/
Vue.component('dark-component', {
  template: `<div @click="active" :class="[{show:show},{dark:true}]"></div>`,
  data() {
    return {
      show: false
    }
  },
  methods: {
    active() {
      this.show = !this.show;
      bus.$emit('slippery', this.show);
    }
  },
  mounted() {
    var that = this;
    bus.$on('slippery', function(value) {
      that.show = value;
    })
  }
})
/*************dark-component end*************/

/************中转站  start*********/
var bus = new Vue();
/************中转站 end************/

/********root start*******/
new Vue({
  el: '.app'
})
/********root start*******/
