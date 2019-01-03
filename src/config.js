export default {
  backendUrl: !process.env.VUE_DEVELOPMENT ? 'http://192.168.0.29:3000/api/rest' : 'https://maker-panel-backend.herokuapp.com/api/rest',
  mapBoxAccessToken: 'pk.eyJ1IjoiZHVzYW5zaW1pYyIsImEiOiJjamp1Zm95ZngxNmJ4M3BtaDV2eXM5dm12In0.t4lx-WhB2TDMI-YTdVZqyg'
}
