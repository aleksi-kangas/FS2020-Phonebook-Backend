const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(express.static('build'))

app.use(cors())

// Create morgan token for showing data in POST request
morgan.token('data', (req, res) => {
    // Show data of the POST request
    if (req.method === 'POST') {
        return JSON.stringify(req.body)
    } else {
        return null
    }
})

// Use custom morgan token for logging (:data)
app.use(morgan(
    ":method :url :status :res[content-length] - :response-time ms :data"))

let people = [
    {
        name: "Arto Hellas",
        number: "040-123456",
        id: 1
    },
    {
        name: "Ada Lovelace",
        number: "39-44-5323523",
        id: 2
    },
    {
        name: "Dan Abramov",
        number: "12-43-234345",
        id: 3
    },
    {
        name: "Mary Poppendieck",
        number: "39-23-6423122",
        id: 4
    }
]

app.get('/info', (req, res) => {
    const info = `There is information of ${people.length} people in the phonebook.`
    const time = Date()

    res.send(`<p>${info}</p><p>${time}</p>`)
})

app.get('/api/people', (req, res) => {
    res.json(people)
})

app.get('/api/people/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = people.find(p => p.id === id)

    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.post('/api/people', (req, res) => {
    const body = req.body

    // Name or number can't be missing
    if (!body.name || !body.number ) {
        return res.status(400).json({
            error: 'content missing'
        })
    }

    // Name must be unique
    if (!people.every(p => p.name !== body.name)) {
        return res.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: Math.floor(Math.random() * 1000)
    }

    people = people.concat(person)
    res.json(person)
})

app.delete('/api/people/:id', (req, res) => {
    const id = Number(req.params.id)
    people = people.filter(p => p.id !== id)

    res.status(204).end()
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})