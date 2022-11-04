import SockJS from "sockjs-client";
import Stomp from "webstomp-client";

//const WS_SERVER_URL = "http://localhost:8080/planus/ws";
const WS_SERVER_URL = "https://planus.co.kr/planus/ws";

const WSAPI = {
  socket: null,
  stomp: null,
  connect(tripId, token, callback) {
    this.socket = new SockJS(WS_SERVER_URL);
    this.stomp = Stomp.over(this.socket);
    this.stomp.debug = () => {
      return;
    };
    this.stomp.connect(
      {},
      () => {
        this.stomp.subscribe("/topic/planus/" + tripId, callback);
        this.enter({ tripId, token });
      },
      (error) => {
        console.log(error);
        this.connect = false;
      }
    );
  },
  enter(member) {
    this.stomp.send("/app/enter", JSON.stringify(member));
  },
  getConnector(member) {
    this.stomp.send("/app/connector", JSON.stringify(member));
  },
  chat(message) {
    this.stomp.send("/app/chat", JSON.stringify(message));
  },
  addBucket(tripId, place, address, lat, lng) {
    console.log("버킷추가");
    let bucket = {
      tripId: tripId,
      place: place,
      address: address,
      lat: lat,
      lng: lng,
    };
    this.stomp.send("/app/addBucket", JSON.stringify(bucket));
  },
  delBucket(tripId, place, address, lat, lng) {
    let bucket = {
      tripId: tripId,
      place: place,
      address: address,
      lat: lat,
      lng: lng,
    };
    this.stomp.send("/app/delBucket", JSON.stringify(bucket));
  },
  setPlan(tripId, planId, tripDate, startTime) {
    let plan = {
      tripId: tripId,
      planId: planId,
      tripDate: tripDate,
      startTime: startTime,
    };
    this.stomp.send("app/setPlan", JSON.stringify(plan));
  },

  addTimetable(tripId, planId, costTime, place, lat, lng, fromBucket, address) {
    let timetable = {
      tripId: tripId,
      planId: planId,
      costTime: costTime,
      place: place,
      lat: lat,
      lng: lng,
      fromBucket: fromBucket,
      address: address,
    };
    this.stomp.send("/app/addTimetable", JSON.stringify(timetable));
  },
  delTimetable(timetableList) {
    this.stomp.send("/app/delTimetable", JSON.stringify(timetableList));
  },
};

export default WSAPI;
