module.exports = {
  backendUrl: !process.env.VUE_DEVELOPMENT ? 'http://localhost:3000/api/rest' : 'https://maker-panel-backend.herokuapp.com/api/rest'
}
