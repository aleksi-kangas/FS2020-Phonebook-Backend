require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

// MIDDLEWARE

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

// ROUTES

app.get('/info', (req, res) => {
    Person.find({}).then(people => {
        const info = `There is information of ${people.length} people in the phonebook.`
        const time = Date()
        res.send(`<p>${info}</p><p>${time}</p>`)
        })
})

app.get('/api/people', (req, res) => {
    Person.find({}).then(people => {
        res.json(people.map(person => person.toJSON()))
    })
})

app.get('/api/people/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(person.toJSON())
            } else {
                res.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.post('/api/people', (req, res, next) => {
    const person = new Person({
        name: req.body.name,
        number: req.body.number
    })

    person.save()
        .then(savedPerson => {
            res.json(savedPerson.toJSON())
        })
        .catch(error => next(error))
})

app.put('/api/people/:id', (req, res, next) => {
    const person = {
        number: req.body.number
    }
    Person.findByIdAndUpdate(req.params.id, person, { new: true })
        .then(updatedPerson => {
            res.json(updatedPerson.toJSON())
        })
        .catch(error => next(error))
})

app.delete('/api/people/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(result => {
            res.status(204).end()
        })
        .catch(error => next(error))
})

// Unknown endpoint
const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

// Error handler middleware
const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformed id'})
    }

    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})