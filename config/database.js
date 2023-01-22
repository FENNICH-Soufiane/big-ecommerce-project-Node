const mongoose = require('mongoose');

const dbConnection = () => {
  // connect to mongoose
  mongoose.connect(process.env.DB_URI)
    .then((conn) => {
      console.log(`Database Connected : ${conn.connection.host}`)
    })
    // .catch((err) => {
    //   console.error(`Database Error: ${err}`)
    //   // @desc La méthode process.exit() est utilisée pour terminer le processus 
    //   // @desc qui s'exécute en même temps avec un code de sortie dans NodeJS .
    //   process.exit(1)
    // })
}

module.exports = dbConnection