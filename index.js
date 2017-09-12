const host = process.env.HOST || "127.0.0.1"
const port = process.env.PORT || 4000

const _ = require("lodash")
const jsonServer = require("json-server")
const server = jsonServer.create()
const people = require("./people.json")
const comments = require("./comments.json")
const movies = require("./movies.json").map(movie => ({
  likes: _.uniqBy(movie.likes, "person_id"),
  ...movie
}))

const db = { people, comments, movies }
const dbClone = _.cloneDeep(db)

const router = jsonServer.router(db, { foreignKeySuffix: "_id" })
const middlewares = jsonServer.defaults()

server.get("/people/:id/movies", (req, res) => {
  const result = router.db
    .get("movies")
    .filter(movie => movie.likes.some(like => like.person_id == req.params.id))
    .value()

  res.send(result)
})

server.get("/reset", (req, res) => {
  router.db.setState(_.cloneDeep(dbClone))
  res.send({ message: "database reset" })
})

server.use(middlewares)
server.use(router)

server.listen(port, host, () => {
  console.log(`server started on ${host}:${port}`)
})
